
import { useState } from "react";

interface SummaryEditingProps {
  initialKeyPoints: string[];
  initialDecisions: string[];
  initialActionItems: Array<{
    text: string;
    completed: boolean;
    responsible?: string;
    dueDate?: string;
  }>;
  initialTitle: string;
  initialTranscription: string | null;
  initialTags: string[];
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const useSummaryEditing = ({
  initialKeyPoints,
  initialDecisions,
  initialActionItems,
  initialTitle,
  initialTranscription,
  initialTags,
  setHasUnsavedChanges
}: SummaryEditingProps) => {
  const [editableKeyPoints, setEditableKeyPoints] = useState<string[]>(initialKeyPoints);
  const [editableDecisions, setEditableDecisions] = useState<string[]>(initialDecisions);
  const [actionItems, setActionItems] = useState<{
    text: string;
    completed: boolean;
    responsible?: string;
    dueDate?: string;
  }[]>(initialActionItems);
  const [editableTitle, setEditableTitle] = useState<string>(initialTitle);
  const [editableTranscription, setEditableTranscription] = useState<string | null>(initialTranscription);
  const [tags, setTags] = useState<string[]>(initialTags);

  const handleKeyPointChange = (index: number, text: string) => {
    const updatedPoints = [...editableKeyPoints];
    updatedPoints[index] = text;
    setEditableKeyPoints(updatedPoints);
    setHasUnsavedChanges(true);
  };

  const handleDecisionChange = (index: number, text: string) => {
    const updatedDecisions = [...editableDecisions];
    updatedDecisions[index] = text;
    setEditableDecisions(updatedDecisions);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (text: string) => {
    setEditableTitle(text);
    setHasUnsavedChanges(true);
  };

  const handleTranscriptionChange = (text: string) => {
    setEditableTranscription(text);
    setHasUnsavedChanges(true);
  };

  const addKeyPoint = () => {
    setEditableKeyPoints([...editableKeyPoints, ""]);
    setHasUnsavedChanges(true);
  };

  const removeKeyPoint = (index: number) => {
    const updatedPoints = [...editableKeyPoints];
    updatedPoints.splice(index, 1);
    setEditableKeyPoints(updatedPoints);
    setHasUnsavedChanges(true);
  };

  const addDecision = () => {
    setEditableDecisions([...editableDecisions, ""]);
    setHasUnsavedChanges(true);
  };

  const removeDecision = (index: number) => {
    const updatedDecisions = [...editableDecisions];
    updatedDecisions.splice(index, 1);
    setEditableDecisions(updatedDecisions);
    setHasUnsavedChanges(true);
  };

  const addActionItem = () => {
    setActionItems([...actionItems, { text: "", completed: false }]);
    setHasUnsavedChanges(true);
  };

  const removeActionItem = (index: number) => {
    const updatedItems = [...actionItems];
    updatedItems.splice(index, 1);
    setActionItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleToggleActionItem = (index: number) => {
    setActionItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateActionItemResponsible = (index: number, responsible: string) => {
    setActionItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, responsible } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateActionItemText = (index: number, text: string) => {
    setActionItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, text } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateActionItemDueDate = (index: number, dueDate: string) => {
    setActionItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, dueDate } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      const updatedTags = [...tags, tag.trim()];
      setTags(updatedTags);
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setHasUnsavedChanges(true);
  };

  return {
    editableKeyPoints,
    setEditableKeyPoints,
    editableDecisions,
    setEditableDecisions,
    actionItems,
    setActionItems,
    editableTitle,
    setEditableTitle, 
    editableTranscription,
    setEditableTranscription,
    tags,
    setTags,
    
    handleKeyPointChange,
    handleDecisionChange,
    handleTitleChange,
    handleTranscriptionChange,
    addKeyPoint,
    removeKeyPoint,
    addDecision,
    removeDecision,
    addActionItem,
    removeActionItem,
    handleToggleActionItem,
    handleUpdateActionItemResponsible,
    handleUpdateActionItemText,
    handleUpdateActionItemDueDate,
    handleAddTag,
    handleRemoveTag
  };
};
