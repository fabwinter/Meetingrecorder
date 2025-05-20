
import React from "react";

interface AudioPlayerProps {
  audioURL: string | null;
  visible: boolean;
}

export const AudioPlayer = ({ audioURL, visible }: AudioPlayerProps) => {
  if (!visible || !audioURL) return null;
  
  return (
    <div className="w-full max-w-xs mt-4">
      <audio src={audioURL} controls className="w-full" />
    </div>
  );
};
