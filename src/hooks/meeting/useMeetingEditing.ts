
import { useState } from "react";
import { ExtendedSummaryResult } from "@/types/summary";

export const useMeetingEditing = () => {
  const [actionItems, setActionItems] = useState<{ 
    text: string; 
    completed: boolean;
    responsible?: string;
    dueDate?: string;
  }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableKeyPoints, setEditableKeyPoints] = useState<string[]>([]);
  const [editableDecisions, setEditableDecisions] = useState<string[]>([]);
  const [editableTitle, setEditableTitle] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  return {
    actionItems,
    setActionItems,
    isEditing,
    setIsEditing,
    editableKeyPoints,
    setEditableKeyPoints,
    editableDecisions,
    setEditableDecisions,
    editableTitle,
    setEditableTitle,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    tags,
    setTags,
  };
};
