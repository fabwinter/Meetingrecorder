import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnon);

export interface SummaryOptions {
  length?: 'brief' | 'detailed';
  actionItems?: boolean;
}

export const generateSummary = async (
  transcript: string,
  { length = 'brief', actionItems = true }: SummaryOptions = {},
) => {
  const { data, error } = await supabase.functions.invoke('summarize', {
    body: { transcript, length, actionItems },
  });

  if (error) throw new Error(error.message);
  return data.summary as string;
};