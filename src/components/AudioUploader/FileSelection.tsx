
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from '@/components/ThemeProvider';
import { FileInfo } from './FileInfo';

interface FileSelectionProps {
  file: File | null;
  uploading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileSelection: React.FC<FileSelectionProps> = ({ 
  file, 
  uploading, 
  onFileChange 
}) => {
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";
  
  return (
    <div className="w-full max-w-xs mb-6">
      <Input
        type="file"
        id="audio-file"
        accept="audio/*"
        onChange={onFileChange}
        className="hidden"
        disabled={uploading}
      />
      <div className="flex flex-col gap-2">
        <Button
          variant={isColoredMode ? "colored-button" : "outline"}
          onClick={() => document.getElementById("audio-file")?.click()}
          disabled={uploading}
          className="w-full"
        >
          {file ? "Change File" : "Select File"}
        </Button>
        <FileInfo file={file} />
      </div>
    </div>
  );
};
