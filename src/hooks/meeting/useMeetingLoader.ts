import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExtendedSummaryResult, SupabaseMeetingSummary } from "@/types/summary";
import { generateTagsFromContent } from "../utils/meetingUtils";
import { useToast } from "@/hooks/use-toast";

interface MeetingLoaderProps {
  isAuthenticated: boolean;
  user: { id: string } | null;
  meetingId: string | null;
  setSummary: (summary: ExtendedSummaryResult) => void;
  setDate: (date: string) => void;
  setDuration: (duration: string) => void;
  setEditableTitle: (title: string) => void;
  setEditableKeyPoints: (points: string[]) => void;
  setEditableDecisions: (decisions: string[]) => void;
  setActionItems: (items: any[]) => void;
  setTags: (tags: string[]) => void;
  setTranscription: (transcription: string | null) => void;
  setEditableTranscription: (transcription: string | null) => void;
  setAudioUrl: (url: string | null) => void;
  saveMeetingToDatabase: (
    summaryData: ExtendedSummaryResult, 
    date: string, 
    durationSeconds: number,
    userId: string,
    transcription?: string | null,
    tags?: string[]
  ) => Promise<string>;
}

export const useMeetingLoader = ({
  isAuthenticated,
  user,
  meetingId,
  setSummary,
  setDate,
  setDuration,
  setEditableTitle,
  setEditableKeyPoints,
  setEditableDecisions,
  setActionItems,
  setTags,
  setTranscription,
  setEditableTranscription,
  setAudioUrl,
  saveMeetingToDatabase
}: MeetingLoaderProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    const loadMeetingData = async () => {
      if (!isAuthenticated || !user) return;
      
      // Check if we have this meeting in Supabase already
      if (meetingId && !meetingId.startsWith('meeting_')) {
        try {
          console.log("Loading meeting from Supabase with ID:", meetingId);
          const { data: supabaseMeeting, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('id', meetingId)
            .eq('user_id', user.id)
            .single();
            
          if (error) {
            console.error("Error loading meeting from Supabase:", error);
            toast({
              title: "Error loading meeting",
              description: error.message,
              variant: "destructive"
            });
            return; // Don't proceed further if there was an error
          }
            
          if (supabaseMeeting) {
            console.log("Successfully loaded meeting from Supabase:", supabaseMeeting);
            // Load from Supabase - safely access the JSON properties
            const fullSummaryObj = supabaseMeeting.full_summary as SupabaseMeetingSummary || {};
            
            const transformedSummary: ExtendedSummaryResult = {
              title: fullSummaryObj.title || supabaseMeeting.title,
              summary: fullSummaryObj.summary || "",
              keyPoints: Array.isArray(fullSummaryObj.keyPoints) ? 
                fullSummaryObj.keyPoints : [],
              decisions: Array.isArray(fullSummaryObj.decisions) ? 
                fullSummaryObj.decisions : [],
              actionItems: Array.isArray(fullSummaryObj.actionItems) ? 
                fullSummaryObj.actionItems : [],
              tags: Array.isArray(fullSummaryObj.tags) ? 
                fullSummaryObj.tags : []
            };
            
            setSummary(transformedSummary);
            setDate(supabaseMeeting.date);
            setDuration(supabaseMeeting.duration);
            setEditableTitle(transformedSummary.title);
            setEditableKeyPoints([...transformedSummary.keyPoints]);
            setEditableDecisions([...transformedSummary.decisions]);
            setActionItems(transformedSummary.actionItems || []);
            setTags(transformedSummary.tags || []);
            
            // Try to get transcription from session storage as a fallback
            const sessionTranscription = sessionStorage.getItem("transcription");
            setTranscription(sessionTranscription);
            setEditableTranscription(sessionTranscription);
            
            return; // Skip loading from localStorage check
          }
        } catch (error) {
          console.error("Error loading meeting from Supabase:", error);
          // Fall through to localStorage check
        }
      } else {
        console.log("No valid meetingId found, checking session/local storage");
      }
      
      // Fall back to localStorage or session storage
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        try {
          const meetings = JSON.parse(storedMeetings);
          let meeting = null;
          
          // If we have a meetingId, look up that specific meeting
          if (meetingId) {
            meeting = meetings.find((m: any) => m.id === meetingId);
          } 
          // Otherwise try to get the most recent meeting
          else if (meetings.length > 0) {
            meeting = meetings[meetings.length - 1];
          }
          
          if (meeting) {
            console.log("Loading meeting from localStorage:", meeting);
            // Get the full summary, which might be in different properties
            const meetingSummary = meeting.fullSummary || meeting.full_summary || {};
            
            // Create a summary object formatted how our app expects it
            const formattedSummary = {
              title: meetingSummary.title || meeting.title,
              summary: meetingSummary.summary || "",
              keyPoints: Array.isArray(meetingSummary.keyPoints) ? meetingSummary.keyPoints : [],
              decisions: Array.isArray(meetingSummary.decisions) ? meetingSummary.decisions : [],
              actionItems: Array.isArray(meetingSummary.actionItems) ? meetingSummary.actionItems : [],
              tags: Array.isArray(meetingSummary.tags) ? meetingSummary.tags : []
            };
            
            setSummary(formattedSummary);
            setDate(meeting.date);
            setDuration(meeting.duration);
            setEditableTitle(formattedSummary.title);
            setEditableKeyPoints([...formattedSummary.keyPoints]);
            setEditableDecisions([...formattedSummary.decisions]);
            setActionItems(formattedSummary.actionItems || []);
            setTags(formattedSummary.tags || []);
            
            // Try to get transcription and audio
            setTranscription(meeting.transcription || sessionStorage.getItem("transcription"));
            setEditableTranscription(meeting.transcription || sessionStorage.getItem("transcription"));
            setAudioUrl(sessionStorage.getItem("lastAudioURL") || sessionStorage.getItem("lastRecordingURL"));
            
            return; // Successfully loaded from localStorage
          }
        } catch (error) {
          console.error("Error loading meeting from localStorage:", error);
          // Fall through to session storage
        }
      }
      
      // Load from session storage as the last resort
      loadFromSessionStorage();
    };
    
    const loadFromSessionStorage = () => {
      console.log("Loading meeting data from sessionStorage");
      // Load summary data from sessionStorage
      const storedSummary = sessionStorage.getItem("meetingSummary");
      const storedTranscription = sessionStorage.getItem("transcription");
      const storedAudioUrl = sessionStorage.getItem("lastAudioURL") || sessionStorage.getItem("lastRecordingURL");
      const recordingDuration = sessionStorage.getItem("recordingDuration");
      
      if (storedSummary) {
        try {
          const parsedSummary = JSON.parse(storedSummary) as ExtendedSummaryResult;
          console.log("Parsed summary from session storage:", parsedSummary);
          
          setSummary(parsedSummary);
          setEditableTitle(parsedSummary.title || "Meeting Summary");
          setEditableKeyPoints(Array.isArray(parsedSummary.keyPoints) ? [...parsedSummary.keyPoints] : []);
          setEditableDecisions(Array.isArray(parsedSummary.decisions) ? [...parsedSummary.decisions] : []);
          setActionItems(Array.isArray(parsedSummary.actionItems) ? parsedSummary.actionItems : []);
          
          // Generate tags if not already present
          if (!parsedSummary.tags || parsedSummary.tags.length === 0) {
            const generatedTags = generateTagsFromContent(parsedSummary, storedTranscription || "");
            setTags(generatedTags);
          } else {
            setTags(parsedSummary.tags);
          }
        } catch (error) {
          console.error("Error parsing meetingSummary from sessionStorage:", error);
          toast({
            title: "Error loading meeting",
            description: "The meeting data appears to be corrupted",
            variant: "destructive"
          });
        }
      }
      
      if (storedTranscription) {
        setTranscription(storedTranscription);
        setEditableTranscription(storedTranscription);
      }
      
      if (storedAudioUrl) {
        setAudioUrl(storedAudioUrl);
      }
      
      // Set current date
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setDate(currentDate);
      
      // Set duration from recording if available
      if (recordingDuration) {
        const seconds = parseInt(recordingDuration, 10);
        const minutes = Math.floor(seconds / 60);
        setDuration(`${minutes} minutes`);
      } else {
        setDuration("0 minutes"); // Default
      }
    };
    
    // Try to load the meeting
    loadMeetingData();
    
  }, [meetingId, isAuthenticated, user, setSummary, setDate, setDuration, setEditableTitle, 
      setEditableKeyPoints, setEditableDecisions, setActionItems, setTags, setTranscription, 
      setEditableTranscription, setAudioUrl, saveMeetingToDatabase, toast]);
};
