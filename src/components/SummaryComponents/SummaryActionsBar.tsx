
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  Edit,
  FileText,
  Save,
  Share,
  File,
  FolderPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SummaryActionsBarProps {
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onShare: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onDownloadText: () => void;
  onDownloadAudio: () => void;
  onMoveToFolder?: () => void; // Added prop for Move to Category
}

export function SummaryActionsBar({
  isEditing,
  hasUnsavedChanges,
  onSave,
  onEdit,
  onCopy,
  onShare,
  onExportPdf,
  onExportDocx,
  onDownloadText,
  onDownloadAudio,
  onMoveToFolder,
}: SummaryActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-3 sticky bottom-16 bg-background border-t">
      {isEditing ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={!hasUnsavedChanges}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          
          {/* Move to Category button */}
          {onMoveToFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveToFolder}
            >
              <FolderPlus className="mr-1 h-4 w-4" />
              Categorize
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
          >
            <Copy className="mr-1 h-4 w-4" />
            Copy
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
          >
            <Share className="mr-1 h-4 w-4" />
            Share
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportPdf}>
                <File className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportDocx}>
                <File className="mr-2 h-4 w-4" />
                Word Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadText}>
                <FileText className="mr-2 h-4 w-4" />
                Raw Transcript
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadAudio}>
                <FileText className="mr-2 h-4 w-4" />
                Audio Recording
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
