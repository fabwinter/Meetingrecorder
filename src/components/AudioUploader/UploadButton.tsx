
import React from 'react';
import { Button } from "@/components/ui/button";
import { MAX_FILE_SIZE_MB } from './utils';
import { useTheme } from '@/components/ThemeProvider';
import { TranscriptionStatus } from '@/hooks/useTranscriptionService';

interface UploadButtonProps {
  file: File | null;
  uploadComplete: boolean;
  uploading: boolean;
  status: TranscriptionStatus;
  onUpload: () => Promise<void>;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ 
  file, 
  uploadComplete, 
  uploading, 
  status, 
  onUpload 
}) => {
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";
  
  if (!file || uploadComplete || uploading || status !== TranscriptionStatus.Idle) {
    return null;
  }
  
  return (
    <>
      <Button
        onClick={onUpload}
        className="w-full max-w-xs"
        variant={isColoredMode ? "colored-button" : "default"}
      >
        Upload Audio
      </Button>
      
      <p className={`text-xs ${
        isColoredMode 
          ? isYellowTheme 
            ? "text-black" 
            : "text-white" 
          : "text-muted-foreground"
      } mt-2`}>
        Supported formats: MP3, WAV, M4A, OGG, AAC (max {MAX_FILE_SIZE_MB}MB)
      </p>
    </>
  );
};
