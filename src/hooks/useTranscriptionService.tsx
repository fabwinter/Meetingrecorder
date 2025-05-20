
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionResult, SummaryResult } from "@/services/transcriptionService";
import { getAPITranscriptionService } from "@/services/apiTranscriptionService";
import { supabase } from "@/integrations/supabase/client";

export enum TranscriptionStatus {
  Idle = "idle",
  Preparing = "preparing",
  Transcribing = "transcribing",
  Summarizing = "summarizing",
  Complete = "complete",
  Error = "error"
}

export function useTranscriptionService() {
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.Idle);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<{ cost: number; currency: string } | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id });
      } else {
        setUser(null);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch OpenAI API key from Supabase Edge Function
  useEffect(() => {
    if (user) {
      const fetchApiKey = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('get-openai-key');
          
          if (error) {
            console.error("Error fetching API key:", error);
            return;
          }
          
          if (data?.apiKey) {
            setApiKey(data.apiKey);
            
            // Update the API transcription service with the new key
            getAPITranscriptionService({
              apiKey: data.apiKey
            });
          }
        } catch (err) {
          console.error("Failed to fetch API key:", err);
        }
      };
      
      fetchApiKey();
    }
  }, [user]);

  useEffect(() => {
    // Cleanup function
    return () => {
      const service = getAPITranscriptionService();
      service.cancelOngoing();
    };
  }, []);

  const handleError = (error: Error) => {
    console.error("Transcription service error:", error);
    setError(error.message);
    setStatus(TranscriptionStatus.Error);
    
    toast({
      title: "Processing Error",
      description: error.message,
      variant: "destructive",
    });
  };

  const resetState = () => {
    setStatus(TranscriptionStatus.Idle);
    setProgress(0);
    setError(null);
    setTranscription(null);
    setSummary(null);
    setEstimatedCost(null);
  };

  const estimateAudioCost = (durationSeconds: number) => {
    const service = getAPITranscriptionService({ apiKey });
    const cost = service.estimateCost(durationSeconds);
    setEstimatedCost(cost);
    return cost;
  };

  // Function to check if there's a valid API key
  const hasValidApiKey = (): boolean => {
    return !!apiKey;
  };

  // Process audio (either from recording or file upload)
  const processAudio = async (audioBlob: Blob, audioDuration?: number): Promise<void> => {
    try {
      resetState();
      setStatus(TranscriptionStatus.Preparing);
      
      if (!apiKey) {
        throw new Error("API key is required for transcription");
      }
      
      // Estimate cost if duration is provided
      if (audioDuration) {
        estimateAudioCost(audioDuration);
      }
      
      const service = getAPITranscriptionService({
        apiKey,
        onProgress: (progressValue) => {
          setProgress(progressValue);
        },
        onError: handleError,
      });
      
      // Start transcription
      setStatus(TranscriptionStatus.Transcribing);
      const result = await service.transcribeAudio(audioBlob);
      
      // Set transcription result
      setTranscription(result.text);
      sessionStorage.setItem("transcription", result.text);
      
      // Generate summary
      setStatus(TranscriptionStatus.Summarizing);
      const summaryResult = await service.generateSummary(result.text);
      
      // Set summary result
      setSummary(summaryResult);
      sessionStorage.setItem("meetingSummary", JSON.stringify(summaryResult));
      
      // Save to user's meeting history if user is authenticated
      if (user) {
        const meeting = {
          id: crypto.randomUUID(),
          userId: user.id,
          title: summaryResult.title || "Untitled Meeting",
          date: new Date().toISOString(),
          duration: audioDuration ? `${Math.round(audioDuration / 60)} min` : "Unknown",
          fullSummary: summaryResult,
          transcription: result.text,
        };
        
        // Save to localStorage for now (would be replaced with database storage in production)
        const storedMeetings = localStorage.getItem('meetings') || '[]';
        const meetings = JSON.parse(storedMeetings);
        meetings.push(meeting);
        localStorage.setItem('meetings', JSON.stringify(meetings));
      }
      
      // Complete
      setStatus(TranscriptionStatus.Complete);
      setProgress(100);
      
      return Promise.resolve();
    } catch (error: any) {
      handleError(error);
      return Promise.reject(error);
    }
  };

  return {
    status,
    progress,
    error,
    transcription,
    summary,
    estimatedCost,
    processAudio,
    resetState,
    estimateAudioCost,
    hasValidApiKey,
  };
}
