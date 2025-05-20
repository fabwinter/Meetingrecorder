
import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { ExtendedSummaryResult, SupabaseMeetingSummary } from "@/types/summary";
import { useToast } from "@/hooks/use-toast";

export const useMeetingSummaryData = (user: { id: string } | null) => {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('id');
  const [summary, setSummary] = useState<ExtendedSummaryResult | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [editableTranscription, setEditableTranscription] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { toast } = useToast();
  
  // Setup authentication
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Check session storage for any recently created summary
  useEffect(() => {
    if (!summary) {
      const storedSummary = sessionStorage.getItem("meetingSummary");
      if (storedSummary) {
        try {
          const parsedSummary = JSON.parse(storedSummary);
          if (parsedSummary && typeof parsedSummary === 'object') {
            console.log("Found stored summary in session storage:", parsedSummary);
            setSummary(parsedSummary);
          }
        } catch (error) {
          console.error("Error parsing stored summary:", error);
        }
      }
    }
  }, [summary]);

  return {
    meetingId,
    summary,
    setSummary,
    transcription,
    setTranscription,
    editableTranscription,
    setEditableTranscription,
    audioUrl,
    setAudioUrl,
    date,
    setDate,
    duration,
    setDuration,
    isAuthenticated,
  };
};
