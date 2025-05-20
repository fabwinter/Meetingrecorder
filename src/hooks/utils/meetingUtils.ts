
import { ExtendedSummaryResult } from "@/types/summary";
import { sanitizeForJson } from "@/types/recording";
import { supabase } from "@/integrations/supabase/client";

// Helper function to generate tags based on meeting content and transcript
export const generateTagsFromContent = (summaryData: ExtendedSummaryResult, transcriptText: string): string[] => {
  // Combine all content for analysis
  const allContent = [
    summaryData.title,
    ...summaryData.keyPoints,
    ...summaryData.decisions,
    ...(summaryData.actionItems?.map(item => item.text) || []),
    transcriptText
  ].join(" ");
  
  // List of common words to exclude
  const commonWords = [
    "meeting", "the", "a", "an", "and", "or", "but", "for", "with", "about", "in", "on", "at", "to", "of", "by", 
    "that", "this", "these", "those", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", 
    "do", "does", "did", "will", "would", "should", "could", "might", "may", "can", "not", "more", "most", 
    "some", "such", "than", "then", "too", "very", "just", "now", "also", "like", "so", "from", "get", "got", 
    "getting", "there", "their", "they", "them", "when", "where", "which", "who", "whom", "whose", "what", 
    "why", "how", "all", "any", "both", "each", "few", "many", "some", "such", "you", "your", "we", "our"
  ];
  
  // Extract potential names (capitalized words)
  const nameRegex = /\b[A-Z][a-z]+\b/g;
  const potentialNames = allContent.match(nameRegex) || [];
  const namesSet = new Set(potentialNames);
  
  // Extract key topics using word frequency, focusing on nouns and important terms
  const words = allContent.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  
  // Count word frequency, excluding common words
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    if (!commonWords.includes(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Get top topics based on frequency
  const topTopics = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([word]) => word);
  
  // Combine names and topics, prioritize names
  const combinedTags: string[] = [...namesSet].slice(0, 3);
  
  // Add topics not already included as names
  topTopics.forEach(topic => {
    if (combinedTags.length < 8 && !combinedTags.includes(topic)) {
      combinedTags.push(topic);
    }
  });
  
  return combinedTags;
};

// Function to save a meeting to both local storage and Supabase
export const saveMeetingToDatabase = async (
  summaryData: ExtendedSummaryResult, 
  date: string, 
  durationSeconds: number,
  userId: string,
  transcription?: string | null,
  tags?: string[]
): Promise<string> => {
  // Generate a unique id for this meeting if using local storage first
  const localMeetingId = `meeting_${Date.now()}`;
  
  try {
    // Create meeting object with properly formatted data
    const fullSummaryWithTags = {
      ...summaryData,
      tags: tags && tags.length > 0 ? tags : (summaryData.tags || [])
    };
    
    // Prepare the meeting record for Supabase
    const meetingRecord = {
      title: summaryData.title,
      date: date,
      duration: `${Math.floor(durationSeconds / 60)} minutes`,
      user_id: userId,
      full_summary: sanitizeForJson(fullSummaryWithTags)
    };
    
    console.log("Saving meeting to Supabase:", meetingRecord);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('meetings')
      .insert([meetingRecord])
      .select();
    
    if (error) {
      throw error;
    }
    
    const savedMeetingId = data && data[0] ? data[0].id : localMeetingId;
    
    console.log("Meeting saved with ID:", savedMeetingId);
    
    // Update local storage version too
    const meetingForLocalStorage = {
      id: savedMeetingId,
      userId: userId,
      title: summaryData.title,
      date: date,
      duration: `${Math.floor(durationSeconds / 60)} minutes`,
      keyPoints: summaryData.keyPoints.slice(0, 3),
      tags: tags || summaryData.tags,
      fullSummary: fullSummaryWithTags,
      transcription: transcription
    };
    
    // Get existing meetings or create new array
    const existingMeetingsJSON = localStorage.getItem('meetings');
    let meetings = existingMeetingsJSON ? JSON.parse(existingMeetingsJSON) : [];
    
    // Add as new meeting at beginning of array
    meetings = [meetingForLocalStorage, ...meetings.filter((m: any) => m.id !== savedMeetingId)];
    
    // Save back to localStorage
    localStorage.setItem('meetings', JSON.stringify(meetings));
    
    return savedMeetingId;
  } catch (error) {
    console.error("Error saving meeting:", error);
    
    // Fallback to local storage only
    const meeting = {
      id: localMeetingId,
      userId: userId,
      title: summaryData.title,
      date: date,
      duration: `${Math.floor(durationSeconds / 60)} minutes`,
      keyPoints: summaryData.keyPoints.slice(0, 3),
      tags: tags || summaryData.tags,
      fullSummary: {
        ...summaryData,
        tags: tags || summaryData.tags
      },
      transcription: transcription
    };
    
    // Get existing meetings or create new array
    const existingMeetingsJSON = localStorage.getItem('meetings');
    let meetings = existingMeetingsJSON ? JSON.parse(existingMeetingsJSON) : [];
    
    // Add as new meeting at beginning of array
    meetings.unshift(meeting);
    
    // Save back to localStorage
    localStorage.setItem('meetings', JSON.stringify(meetings));
    
    return localMeetingId;
  }
};
