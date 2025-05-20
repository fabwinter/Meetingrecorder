
import { Json } from "@/integrations/supabase/types";

export enum RecordingStatus {
  IDLE = "idle",
  RECORDING = "recording",
  ERROR = "error",
  REQUESTING = "requesting"
}

export interface Decision {
  id: string;
  text: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  dueDate?: string;
  completed: boolean;
}

export interface MeetingSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  decisions: Decision[];
  actionItems: ActionItem[];
  tags: string[];
}

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  date: string;
  duration: string;
  folder_id: string | null;
  full_summary: MeetingSummary;
}

export interface SupabaseMeeting {
  id: string;
  user_id: string;
  title: string;
  date: string;
  duration: string;
  folder_id: string | null;
  full_summary: Json;
}

// Helper function to transform Supabase meeting data to our application Meeting type
export const transformSupabaseMeeting = (meeting: SupabaseMeeting): Meeting => {
  // Handle case where full_summary might be null or undefined
  const fullSummary = meeting.full_summary as any || {};
  
  // Ensure all required properties exist with default values if missing
  const transformedSummary: MeetingSummary = {
    title: fullSummary.title || meeting.title,
    summary: fullSummary.summary || "",
    keyPoints: Array.isArray(fullSummary.keyPoints) ? fullSummary.keyPoints : [],
    decisions: Array.isArray(fullSummary.decisions) ? fullSummary.decisions : [],
    actionItems: Array.isArray(fullSummary.actionItems) ? fullSummary.actionItems : [],
    tags: Array.isArray(fullSummary.tags) ? fullSummary.tags : []
  };
  
  return {
    id: meeting.id,
    user_id: meeting.user_id,
    title: meeting.title,
    date: meeting.date,
    duration: meeting.duration,
    folder_id: meeting.folder_id,
    full_summary: transformedSummary
  };
};

export const transformSupabaseMeetings = (meetings: SupabaseMeeting[]): Meeting[] => {
  return meetings.map(transformSupabaseMeeting);
};

export const sanitizeForJson = (data: any): Json => {
  return JSON.parse(JSON.stringify(data));
};
