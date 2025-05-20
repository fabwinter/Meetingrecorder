
import React from "react";
import { Mic, MicOff } from "lucide-react";
import { RecordingStatus } from "@/types/recording";
import { formatTime } from "./utils";
import { useTheme } from "@/components/ThemeProvider";

interface RecordingUIProps {
  recordingStatus: RecordingStatus;
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const RecordingUI = ({ 
  recordingStatus, 
  isRecording, 
  recordingTime, 
  onStartRecording, 
  onStopRecording 
}: RecordingUIProps) => {
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";

  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else if (recordingStatus !== RecordingStatus.REQUESTING && recordingStatus !== RecordingStatus.ERROR) {
      onStartRecording();
    }
  };

  return (
    <>
      <div 
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
          recordingStatus === RecordingStatus.REQUESTING
            ? "bg-amber-500 text-white"
            : isRecording 
              ? "bg-destructive text-destructive-foreground animate-pulse-recording" 
              : recordingStatus === RecordingStatus.ERROR
                ? "bg-destructive text-white"
                : "bg-muted"
        }`}
        onClick={handleClick}
      >
        {isRecording ? (
          <MicOff size={40} />
        ) : (
          <Mic 
            size={40} 
            className={
              isColoredMode 
                ? isYellowTheme 
                  ? "text-black" 
                  : "text-white" 
                : "text-primary"
            } 
          />
        )}
      </div>

      {isRecording && (
        <div className="mb-6 text-center">
          <span 
            className={`text-lg font-medium ${
              isColoredMode 
                ? isYellowTheme 
                  ? "text-black" 
                  : "text-white" 
                : ""
            }`}
          >
            {formatTime(recordingTime)}
          </span>
        </div>
      )}
    </>
  );
};
