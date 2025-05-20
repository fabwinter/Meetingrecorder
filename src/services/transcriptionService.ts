
// Mock service for audio transcription and summarization
// In a production app, this would call a real API (e.g., OpenAI Whisper API)

export interface TranscriptionResult {
  text: string;
  confidence: number;
}

export interface SummaryResult {
  title: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { 
    text: string; 
    completed: boolean;
    responsible?: string;
    dueDate?: string; 
  }[];
  participants?: string[];
}

export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
  console.log("Transcribing audio file:", audioBlob.size, "bytes");
  
  // In a real app, we would upload the audio to a server for transcription
  // For now, simulate an API call with a delay
  return new Promise((resolve) => {
    // Simulate processing time based on file size
    const processingTime = Math.min(3000, audioBlob.size / 10000);
    
    setTimeout(() => {
      // Return mock transcription
      resolve({
        text: "This is a mock transcription of your audio file. In a real application, this would contain the actual transcription from an API like OpenAI's Whisper. The text would include all the spoken content from your meeting, properly formatted and punctuated.",
        confidence: 0.92,
      });
    }, processingTime);
  });
};

export const generateSummary = async (transcription: string): Promise<SummaryResult> => {
  console.log("Generating summary from transcription:", transcription.substring(0, 100) + "...");
  
  // In a real app, we would send the transcription to an LLM API (e.g., GPT-4)
  // For now, simulate an API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return mock summary
      resolve({
        title: "Q2 Marketing Strategy Meeting",
        keyPoints: [
          "Discussed Q2 marketing budget allocation across channels",
          "Reviewed performance of last quarter's social media campaigns",
          "Identified target demographics for new product launch",
          "Evaluated competitor marketing strategies",
          "Planned content calendar for next eight weeks"
        ],
        decisions: [
          "Increase budget for influencer marketing by 15%",
          "Reduce spend on print advertising by 30%"
        ],
        actionItems: [
          { 
            text: "Maya to finalize influencer outreach list by Friday", 
            completed: false,
            responsible: "Maya",
            dueDate: "Friday" 
          },
          { 
            text: "Alex to update content calendar with new campaign dates", 
            completed: false,
            responsible: "Alex",
            dueDate: "Next Monday" 
          },
          { 
            text: "Taylor to prepare competitive analysis report", 
            completed: false,
            responsible: "Taylor",
            dueDate: "May 30" 
          },
          { 
            text: "Jordan to schedule meeting with social media agency", 
            completed: false,
            responsible: "Jordan",
            dueDate: "" 
          }
        ],
        participants: ["Alex Chen", "Maya Johnson", "Taylor Smith", "Jordan Lee"],
      });
    }, 2000);
  });
};
