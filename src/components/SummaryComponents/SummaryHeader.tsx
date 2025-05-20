
import React from "react";
import { Input } from "@/components/ui/input";

interface SummaryHeaderProps {
  title: string;
  date: string;
  duration: string;
  isEditing: boolean;
  onTitleChange: (text: string) => void;
}

export const SummaryHeader = ({
  title,
  date,
  duration,
  isEditing,
  onTitleChange,
}: SummaryHeaderProps) => {
  return (
    <>
      {!isEditing ? (
        <h2 className="text-2xl font-semibold mb-1">{title}</h2>
      ) : (
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-2xl font-semibold mb-1 h-auto py-1"
        />
      )}
      <div className="flex gap-2 text-sm text-muted-foreground">
        <span>{date}</span>
        <span>•</span>
        <span>{duration}</span>
      </div>
    </>
  );
};
