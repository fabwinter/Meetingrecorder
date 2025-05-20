
import React from "react";
import { Button } from "@/components/ui/button";
import { RecordingStatus } from "@/types/recording";
import { TranscriptionStatus } from "@/hooks/useTranscriptionService";
import { useTheme } from "@/components/ThemeProvider";

interface ActionButtonsProps {
  isRecording: boolean;
  recordingStatus: RecordingStatus;
  transcriptionStatus: TranscriptionStatus;
  onStopRecording: () => void;
  onStartRecording: () => void;
  onRetry: () => void;
}

export const ActionButtons = ({ 
  isRecording, 
  recordingStatus, 
  transcriptionStatus,
  onStopRecording,
  onStartRecording,
  onRetry
}: ActionButtonsProps) => {
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";
  
  // Fix the type comparison by using separate conditions
  if (recordingStatus === RecordingStatus.REQUESTING || transcriptionStatus !== "idle") {
    return null;
  }
  
  // Determine button variant based on state and theme
  const getButtonVariant = () => {
    if (isRecording) {
      return "destructive";
    } else if (recordingStatus === RecordingStatus.ERROR) {
      return "outline";
    } else if (isColoredMode && isYellowTheme) {
      return "colored-button"; // Special case for yellow theme (black button with yellow text)
    } else if (isColoredMode) {
      return "colored-button"; // Now all colored themes use colored-button (white buttons)
    } else {
      return "default";
    }
  };
  
  return (
    <Button
      onClick={isRecording ? onStopRecording : recordingStatus === RecordingStatus.ERROR ? onRetry : onStartRecording}
      className="w-full max-w-xs mb-4"
      variant={getButtonVariant()}
    >
      {isRecording 
        ? "Stop Recording" 
        : recordingStatus === RecordingStatus.ERROR 
          ? "Try Again" 
          : "Start Recording"}
    </Button>
  );
};
