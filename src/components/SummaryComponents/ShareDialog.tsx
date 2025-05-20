
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon } from "lucide-react";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  shareLink: string;
  shareEmail: string;
  onShareEmailChange: (email: string) => void;
  onSendEmail: (email: string) => void;
  onCopyLink: () => void;
  meetingSummary?: {
    title?: string;
    keyPoints?: string[];
    decisions?: string[];
    actionItems?: {
      task: string;
      assignee: string;
      dueDate: string;
    }[];
  };
}

export const ShareDialog = ({
  isOpen,
  onOpenChange,
  shareLink,
  shareEmail,
  onShareEmailChange,
  onSendEmail,
  onCopyLink,
  meetingSummary,
}: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [formattedSummary, setFormattedSummary] = useState("");

  useEffect(() => {
    if (meetingSummary) {
      // Create a nicely formatted summary for sharing
      let summary = "";
      
      if (meetingSummary.title) {
        summary += `# ${meetingSummary.title}\n\n`;
      }
      
      if (meetingSummary.keyPoints && meetingSummary.keyPoints.length > 0) {
        summary += "## Key Points\n";
        meetingSummary.keyPoints.forEach(point => {
          summary += `- ${point}\n`;
        });
        summary += "\n";
      }
      
      if (meetingSummary.decisions && meetingSummary.decisions.length > 0) {
        summary += "## Decisions\n";
        meetingSummary.decisions.forEach(decision => {
          summary += `- ${decision}\n`;
        });
        summary += "\n";
      }
      
      if (meetingSummary.actionItems && meetingSummary.actionItems.length > 0) {
        summary += "## Action Items\n";
        meetingSummary.actionItems.forEach(item => {
          summary += `- ${item.task} (Assigned to: ${item.assignee}, Due: ${item.dueDate})\n`;
        });
      }
      
      setFormattedSummary(summary);
    }
  }, [meetingSummary]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Meeting Summary</DialogTitle>
          <DialogDescription>
            Share this meeting summary via email or link
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Meeting Summary</h4>
            <Textarea 
              value={formattedSummary} 
              className="h-40 font-mono text-sm" 
              readOnly 
            />
            <div className="mt-2">
              <Button 
                onClick={handleCopy} 
                className="w-full flex items-center justify-center gap-2"
              >
                {copied ? <CheckIcon size={16} /> : null}
                {copied ? "Copied!" : "Copy Summary"}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Share via Email</h4>
            <div className="flex gap-2">
              <Input
                placeholder="recipient@example.com"
                value={shareEmail}
                onChange={(e) => onShareEmailChange(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => onSendEmail(shareEmail)}>Send</Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Copy Link</h4>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button onClick={onCopyLink}>Copy</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
