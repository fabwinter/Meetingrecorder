
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTheme } from '@/components/ThemeProvider';

interface UploadProgressProps {
  uploading: boolean;
  uploadProgress: number;
  onCancel: () => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ 
  uploading, 
  uploadProgress, 
  onCancel 
}) => {
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";
  
  if (!uploading) return null;
  
  return (
    <div className="w-full max-w-xs mb-6">
      <Progress value={uploadProgress} className="h-2" />
      <div className="flex justify-between items-center mt-2">
        <p className={`text-sm ${
          isColoredMode 
            ? isYellowTheme 
              ? "text-black" 
              : "text-white" 
            : "text-muted-foreground"
        }`}>
          Uploading... {uploadProgress}%
        </p>
        <Button 
          variant={isColoredMode ? "colored-outline" : "ghost"}
          size="sm" 
          onClick={onCancel}
          className="text-xs h-6"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
