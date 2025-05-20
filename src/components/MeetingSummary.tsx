
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoveToFolderDialog } from "./MoveToFolderDialog";

// Import our new components
import { SummaryHeader } from "./SummaryComponents/SummaryHeader";
import { TagsSection } from "./SummaryComponents/TagsSection";
import { KeyPointsSection } from "./SummaryComponents/KeyPointsSection";
import { DecisionsSection } from "./SummaryComponents/DecisionsSection";
import { ActionItemsSection } from "./SummaryComponents/ActionItemsSection";
import { TranscriptSection } from "./SummaryComponents/TranscriptSection";
import { SummaryActionsBar } from "./SummaryComponents/SummaryActionsBar";
import { ShareDialog } from "./SummaryComponents/ShareDialog";

// Import custom hooks
import { useMeetingSummary } from "@/hooks/useMeetingSummary";
import { useMeetingActions } from "@/hooks/useMeetingActions";
import { useSummaryEditing } from "@/hooks/useSummaryEditing";
import { ExtendedSummaryResult } from "@/types/summary";

export const MeetingSummary = ({ user }: { user: { id: string } | null }) => {
  // Initialize state using our hooks
  const [activeTab, setActiveTab] = useState("summary");
  const summaryRef = useRef<HTMLDivElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Get meeting data and state
  const {
    summary,
    setSummary,
    transcription,
    setTranscription,
    editableTranscription: initialTranscription, // Renamed to avoid the conflict
    audioUrl,
    date,
    duration,
    actionItems: initialActionItems,
    isEditing,
    setIsEditing,
    editableKeyPoints: initialEditableKeyPoints,
    editableDecisions: initialEditableDecisions,
    editableTitle: initialEditableTitle,
    tags: initialTags,
    isAuthenticated,
    meetingId,
  } = useMeetingSummary(user);
  
  // Get editing functions - initialize this hook only once at component level
  const {
    editableKeyPoints,
    editableDecisions,
    actionItems,
    editableTitle,
    editableTranscription,
    tags,
    
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
  } = useSummaryEditing({
    initialKeyPoints: initialEditableKeyPoints || [],
    initialDecisions: initialEditableDecisions || [],
    initialActionItems: initialActionItems || [],
    initialTitle: initialEditableTitle || "",
    initialTranscription: initialTranscription, // Use the renamed variable
    initialTags: initialTags || [],
    setHasUnsavedChanges
  });
  
  // Initialize meeting action handlers
  const {
    shareEmail,
    setShareEmail,
    shareLink,
    setShareLink,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    isMoveToFolderOpen,
    setIsMoveToFolderOpen,
    updateMeeting,
    handleCopyToClipboard,
    handleShare,
    handleCopyLink,
    handleSendEmail,
    exportToPdf,
    downloadAsDocx,
    downloadAudio,
    downloadRawText,
    handleToggleEditMode,
    handleMoveToCategory
  } = useMeetingActions({
    summary,
    setSummary,
    meetingId,
    editableTitle,
    editableKeyPoints,
    editableDecisions,
    actionItems,
    tags,
    date,
    duration,
    transcription,
    editableTranscription, // Keep this as is
    setIsEditing,
    setHasUnsavedChanges,
    summaryRef,
    user,
    isAuthenticated,
    audioUrl,
    isEditing
  });
  
  // Update the editables when the initial values change
  useEffect(() => {
    if (initialEditableKeyPoints?.length > 0 && editableKeyPoints.length === 0) {
      // Just signal no unsaved changes when initial data arrives
      setHasUnsavedChanges(false);
    }
  }, [initialEditableKeyPoints, initialEditableDecisions, initialActionItems, initialEditableTitle, editableKeyPoints.length]);

  const handleMoveSuccess = () => {
    setIsMoveToFolderOpen(false);
  };

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p>No meeting summary available. Record or upload a meeting first.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4" ref={summaryRef}>
        <SummaryHeader
          title={editableTitle}
          date={date}
          duration={duration}
          isEditing={isEditing}
          onTitleChange={handleTitleChange}
        />
        
        <TagsSection
          tags={tags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="pt-4">
            <KeyPointsSection
              points={editableKeyPoints}
              isEditing={isEditing}
              onPointChange={handleKeyPointChange}
              onRemovePoint={removeKeyPoint}
              onAddPoint={addKeyPoint}
            />

            <DecisionsSection
              decisions={editableDecisions}
              isEditing={isEditing}
              onDecisionChange={handleDecisionChange}
              onRemoveDecision={removeDecision}
              onAddDecision={addDecision}
            />

            <ActionItemsSection
              actionItems={actionItems}
              isEditing={isEditing}
              onToggleActionItem={handleToggleActionItem}
              onUpdateActionItemText={handleUpdateActionItemText}
              onUpdateActionItemResponsible={handleUpdateActionItemResponsible}
              onUpdateActionItemDueDate={handleUpdateActionItemDueDate}
              onRemoveActionItem={removeActionItem}
              onAddActionItem={addActionItem}
            />
          </TabsContent>
          
          <TabsContent value="transcript" className="pt-4">
            <TranscriptSection
              transcription={transcription}
              audioUrl={audioUrl}
              isEditing={isEditing}
              onTranscriptionChange={handleTranscriptionChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      <SummaryActionsBar
        isEditing={isEditing}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={updateMeeting}
        onEdit={handleToggleEditMode}
        onCopy={handleCopyToClipboard}
        onShare={handleShare}
        onExportPdf={exportToPdf}
        onExportDocx={downloadAsDocx}
        onDownloadText={downloadRawText}
        onDownloadAudio={downloadAudio}
        onMoveToFolder={handleMoveToCategory}
      />

      <ShareDialog
        isOpen={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        shareLink={shareLink}
        shareEmail={shareEmail}
        onShareEmailChange={setShareEmail}
        onSendEmail={handleSendEmail}
        onCopyLink={handleCopyLink}
      />

      {/* Move to folder dialog */}
      {meetingId && (
        <MoveToFolderDialog
          isOpen={isMoveToFolderOpen}
          onOpenChange={setIsMoveToFolderOpen}
          meetingId={meetingId}
          onMoveSuccess={handleMoveSuccess}
        />
      )}
    </div>
  );
};
