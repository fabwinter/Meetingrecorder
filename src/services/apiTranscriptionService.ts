
import { SummaryResult, TranscriptionResult } from "./transcriptionService";

const API_ENDPOINT = "https://api.openai.com/v1/audio";

export interface TranscriptionServiceConfig {
  apiKey?: string;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export class APITranscriptionService {
  private apiKey: string | undefined;
  private abortController: AbortController | null = null;
  private onProgress: ((progress: number) => void) | undefined;
  private onError: ((error: Error) => void) | undefined;
  private maxRetries: number;
  
  constructor(config: TranscriptionServiceConfig) {
    this.apiKey = config.apiKey;
    this.onProgress = config.onProgress;
    this.onError = config.onError;
    this.maxRetries = config.maxRetries || 2;
  }
  
  getApiKey(): string | undefined {
    return this.apiKey;
  }

  private reportProgress(progress: number) {
    if (this.onProgress) {
      this.onProgress(Math.min(Math.max(progress, 0), 100));
    }
  }
  
  private handleError(error: Error) {
    if (this.onError) {
      this.onError(error);
    }
    throw error;
  }
  
  async transcribeAudio(audioBlob: Blob, retryCount = 0): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      throw new Error("API key is required for transcription");
    }

    console.log("Transcribing audio with API");
    
    // Report initial progress
    this.reportProgress(5);
    
    // Create a new FormData instance to send the audio file
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");
    formData.append("language", "en");
    
    // Create a new AbortController to allow cancelling the request
    this.abortController = new AbortController();
    
    try {
      this.reportProgress(15);

      const response = await fetch(`${API_ENDPOINT}/transcriptions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: formData,
        signal: this.abortController.signal,
      });
      
      this.reportProgress(40);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || response.statusText;
        
        // Handle rate limiting with automatic retry
        if (response.status === 429 && retryCount < this.maxRetries) {
          console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
          return this.transcribeAudio(audioBlob, retryCount + 1);
        }
        
        // Check for specific error types
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your OpenAI API key.");
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorMessage}`);
        } else {
          throw new Error(`Transcription failed: ${response.status} ${errorMessage}`);
        }
      }
      
      const data = await response.json();
      this.reportProgress(50);
      
      return {
        text: data.text,
        confidence: 0.95, // OpenAI doesn't provide confidence scores, so we use a default
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Transcription was cancelled");
      }
      
      // Only retry network errors
      if (error.message.includes('network') && retryCount < this.maxRetries) {
        console.log(`Network error, retrying in ${(retryCount + 1) * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return this.transcribeAudio(audioBlob, retryCount + 1);
      }
      
      this.handleError(error);
      throw error;
    } finally {
      this.abortController = null;
    }
  }
  
  async generateSummary(transcription: string, retryCount = 0): Promise<SummaryResult> {
    if (!this.apiKey) {
      throw new Error("API key is required for summary generation");
    }
    
    console.log("Generating summary with API");
    this.reportProgress(55);
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a meeting summarization assistant. Analyze the meeting transcription and provide:
              1. A title for the meeting
              2. 3-5 key discussion points as bullet points
              3. 2-3 important decisions made, if any
              4. A list of action items with responsible people (if mentioned)
              Format your response as valid JSON with the following structure:
              {
                "title": "Meeting Title",
                "keyPoints": ["point 1", "point 2", ...],
                "decisions": ["decision 1", "decision 2", ...],
                "actionItems": [{"text": "Action 1", "completed": false}, ...]
              }`
            },
            {
              role: "user",
              content: transcription
            }
          ],
          temperature: 0.3,
        })
      });
      
      this.reportProgress(75);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || response.statusText;
        
        // Handle rate limiting with automatic retry
        if (response.status === 429 && retryCount < this.maxRetries) {
          console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
          return this.generateSummary(transcription, retryCount + 1);
        }
        
        // Check for specific error types
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your OpenAI API key.");
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorMessage}`);
        } else {
          throw new Error(`Summarization failed: ${response.status} ${errorMessage}`);
        }
      }
      
      const data = await response.json();
      this.reportProgress(90);
      const summaryText = data.choices[0].message.content;
      
      // Extract JSON from the response
      try {
        const summaryJson = JSON.parse(summaryText);
        this.reportProgress(100);
        return {
          title: summaryJson.title || "Meeting Summary",
          keyPoints: summaryJson.keyPoints || [],
          decisions: summaryJson.decisions || [],
          actionItems: summaryJson.actionItems || [],
        };
      } catch (error) {
        console.error("Error parsing summary JSON:", error);
        throw new Error("Failed to parse summary response. The AI returned an invalid format.");
      }
    } catch (error: any) {
      // Only retry network errors
      if (error.message.includes('network') && retryCount < this.maxRetries) {
        console.log(`Network error, retrying in ${(retryCount + 1) * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return this.generateSummary(transcription, retryCount + 1);
      }
      
      this.handleError(error);
      throw error;
    }
  }

  estimateCost(audioLengthSeconds: number): { cost: number; currency: string } {
    // Based on OpenAI's pricing for Whisper API (approximate)
    const minuteRate = 0.006; // $0.006 per minute
    const minutes = audioLengthSeconds / 60;
    
    // Round to 2 decimal places
    const cost = Math.round(minutes * minuteRate * 100) / 100;
    
    return {
      cost,
      currency: "USD"
    };
  }
  
  cancelOngoing() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// Singleton instance with API key
let apiService: APITranscriptionService | null = null;

export const getAPITranscriptionService = (config?: Partial<TranscriptionServiceConfig>): APITranscriptionService => {
  // If config contains an API key, we'll use it to create a new service
  if (config?.apiKey) {
    if (!apiService) {
      apiService = new APITranscriptionService({ ...config });
    } else {
      // Update existing service with new API key
      apiService = new APITranscriptionService({ 
        apiKey: config.apiKey,
        onProgress: config.onProgress || apiService['onProgress'],
        onError: config.onError || apiService['onError'],
        maxRetries: config.maxRetries || apiService['maxRetries'],
      });
    }
    return apiService;
  }
  
  // If no API key provided and no existing service, create a new one
  if (!apiService) {
    apiService = new APITranscriptionService({ ...config });
  } else if (config) {
    // Update existing service with new config (except API key)
    const currentApiKey = apiService.getApiKey();
    apiService = new APITranscriptionService({ 
      apiKey: currentApiKey,
      ...config 
    });
  }
  
  return apiService;
};
