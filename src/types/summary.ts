
import { SummaryResult } from "@/services/transcriptionService";

export interface ExtendedSummaryResult extends Omit<SummaryResult, 'actionItems'> {
  summary: string;
  tags?: string[];
  actionItems: { 
    text: string; 
    completed: boolean;
    responsible?: string;
    dueDate?: string;
  }[];
}

export interface SupabaseMeetingSummary {
  title?: string;
  summary?: string;
  keyPoints?: string[];
  decisions?: string[];
  actionItems?: {
    text: string;
    completed: boolean;
    responsible?: string;
    dueDate?: string;
  }[];
  tags?: string[];
}
