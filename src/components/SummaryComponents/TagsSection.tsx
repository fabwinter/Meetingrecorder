
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const TagsSection = ({ tags, onAddTag, onRemoveTag }: TagsSectionProps) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      setNewTag("");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag) => (
        <div
          key={tag}
          className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1"
        >
          #{tag}
          <button onClick={() => onRemoveTag(tag)} className="hover:text-primary/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add tag..."
          className="h-6 min-w-20 w-24 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddTag();
              e.preventDefault();
            }
          }}
        />
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleAddTag}>
          +
        </Button>
      </div>
    </div>
  );
};
