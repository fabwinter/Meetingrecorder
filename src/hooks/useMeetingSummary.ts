
import { useState, useEffect } from "react";
import { useMeetingSummaryData } from "./meeting/useMeetingSummaryData";
import { useMeetingEditing } from "./meeting/useMeetingEditing";
import { useMeetingLoader } from "./meeting/useMeetingLoader";
import { saveMeetingToDatabase } from "./utils/meetingUtils";

export const useMeetingSummary = (user: { id: string } | null) => {
  // Get base meeting data
  const {
    meetingId,
    summary,
    setSummary,
    transcription,
    setTranscription,
    editableTranscription,
    setEditableTranscription,
    audioUrl,
    date,
    setDate,
    duration,
    setDuration,
    isAuthenticated,
  } = useMeetingSummaryData(user);
  
  // Get editing state
  const {
    actionItems,
    setActionItems,
    isEditing,
    setIsEditing,
    editableKeyPoints,
    setEditableKeyPoints,
    editableDecisions,
    setEditableDecisions,
    editableTitle,
    setEditableTitle,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    tags,
    setTags,
  } = useMeetingEditing();
  
  // Load meeting data
  useMeetingLoader({
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
    setAudioUrl: () => {}, // We're not setting audioUrl in the loader
    saveMeetingToDatabase
  });

  // Export hook values
  return {
    summary,
    setSummary,
    transcription,
    setTranscription,
    editableTranscription,
    setEditableTranscription,
    audioUrl,
    date,
    duration,
    actionItems,
    setActionItems,
    isEditing,
    setIsEditing,
    editableKeyPoints,
    setEditableKeyPoints,
    editableDecisions,
    setEditableDecisions,
    editableTitle,
    setEditableTitle,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    tags,
    setTags,
    isAuthenticated,
    meetingId,
  };
};

// Re-export the utility functions for use elsewhere
export { generateTagsFromContent, saveMeetingToDatabase } from './utils/meetingUtils';
