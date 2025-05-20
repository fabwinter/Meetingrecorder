
import React from 'react';
import { formatFileSize } from './utils';
import { useTheme } from '@/components/ThemeProvider';

interface FileInfoProps {
  file: File | null;
}

export const FileInfo: React.FC<FileInfoProps> = ({ file }) => {
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";
  
  if (!file) return null;
  
  return (
    <div className="text-sm text-center">
      <p className="truncate max-w-full font-medium">
        {file.name}
      </p>
      <p className={`${
        isColoredMode 
          ? isYellowTheme 
            ? "text-black" 
            : "text-white" 
          : "text-muted-foreground"
      }`}>
        {formatFileSize(file.size)}
      </p>
    </div>
  );
};
