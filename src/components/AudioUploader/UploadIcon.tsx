
import React from 'react';
import { Check, FileAudio, Loader2, Upload } from 'lucide-react';
import { TranscriptionStatus } from "@/hooks/useTranscriptionService";
import { useTheme } from '@/components/ThemeProvider';

interface UploadIconProps {
  status: TranscriptionStatus;
  file: File | null;
}

export const UploadIcon: React.FC<UploadIconProps> = ({ status, file }) => {
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";
  
  const getIconColor = () => {
    if (isColoredMode) {
      return isYellowTheme ? "text-black" : "text-white";
    }
    return "text-primary";
  };
  
  return (
    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
      status === TranscriptionStatus.Complete ? "bg-green-500" : 
      status !== TranscriptionStatus.Idle ? "bg-amber-500" : "bg-muted"
    }`}>
      {status === TranscriptionStatus.Complete ? (
        <Check size={40} className="text-white" />
      ) : status !== TranscriptionStatus.Idle ? (
        <Loader2 size={40} className="text-white animate-spin" />
      ) : file ? (
        <FileAudio size={40} className={getIconColor()} />
      ) : (
        <Upload size={40} className={getIconColor()} />
      )}
    </div>
  );
};
