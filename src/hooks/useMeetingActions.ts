import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { ExtendedSummaryResult } from "@/types/summary";
import { sanitizeForJson } from "@/types/recording";
import { saveMeetingToDatabase } from "./useMeetingSummary";

interface MeetingActionProps {
  summary: ExtendedSummaryResult | null;
  setSummary: (summary: ExtendedSummaryResult) => void;
  meetingId: string | null;
  editableTitle: string;
  editableKeyPoints: string[];
  editableDecisions: string[];
  actionItems: any[];
  tags: string[];
  date: string;
  duration: string;
  transcription: string | null;
  editableTranscription: string | null;
  setIsEditing: (isEditing: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  summaryRef: React.RefObject<HTMLDivElement>;
  user: { id: string } | null;
  isAuthenticated: boolean;
  audioUrl: string | null;
  isEditing: boolean; // Add this prop to receive the current editing state
}

export const useMeetingActions = ({
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
  editableTranscription,
  setIsEditing,
  setHasUnsavedChanges,
  summaryRef,
  user,
  isAuthenticated,
  audioUrl,
  isEditing // Add the prop here too
}: MeetingActionProps) => {
  const [shareEmail, setShareEmail] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isMoveToFolderOpen, setIsMoveToFolderOpen] = useState(false);
  
  const { toast } = useToast();

  // Update an existing meeting
  const updateMeeting = async () => {
    if (!summary || !isAuthenticated || !user) return;
    
    try {
      const updatedSummary = {
        title: editableTitle,
        summary: summary.summary,
        keyPoints: editableKeyPoints,
        decisions: editableDecisions,
        actionItems: actionItems, 
        tags: tags
      };
      
      // Check if this is an existing meeting with an ID
      if (meetingId) {
        if (meetingId.startsWith('meeting_')) {
          // This is a local storage meeting - update it there
          const storedMeetings = localStorage.getItem('meetings');
          if (storedMeetings) {
            const meetings = JSON.parse(storedMeetings);
            const updatedMeetings = meetings.map((m: any) => {
              if (m.id === meetingId) {
                return {
                  ...m,
                  title: updatedSummary.title,
                  keyPoints: updatedSummary.keyPoints.slice(0, 3),
                  fullSummary: updatedSummary,
                  transcription: editableTranscription || m.transcription,
                  tags: tags
                };
              }
              return m;
            });
            
            localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
            
            // Check if we need to also save to Supabase
            const meetingToUpdate = meetings.find((m: any) => m.id === meetingId);
            if (meetingToUpdate) {
              // Try to find this meeting in Supabase by title
              const { data, error } = await supabase
                .from("meetings")
                .select("id")
                .eq("user_id", user.id)
                .eq("title", meetingToUpdate.title)
                .maybeSingle();
                
              if (!error && data) {
                // If found in database, update there too
                await supabase
                  .from("meetings")
                  .update({ 
                    title: updatedSummary.title,
                    full_summary: sanitizeForJson(updatedSummary)
                  })
                  .eq("id", data.id)
                  .eq("user_id", user.id);
              } else if (!error) {
                // If not found in database, create it there
                const meetingToSave = {
                  title: updatedSummary.title,
                  date: meetingToUpdate.date,
                  duration: meetingToUpdate.duration,
                  user_id: user.id,
                  full_summary: sanitizeForJson(updatedSummary)
                };
                
                await supabase
                  .from("meetings")
                  .insert([meetingToSave]);
              }
            }
          }
        } else {
          // This is a UUID meeting - update in Supabase
          const { error } = await supabase
            .from('meetings')
            .update({
              title: updatedSummary.title,
              full_summary: sanitizeForJson(updatedSummary)
            })
            .eq('id', meetingId)
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          // Update local storage as well
          const storedMeetings = localStorage.getItem('meetings');
          if (storedMeetings) {
            const meetings = JSON.parse(storedMeetings);
            const updatedMeetings = meetings.map((m: any) => {
              if (m.id === meetingId) {
                return {
                  ...m,
                  title: updatedSummary.title,
                  keyPoints: updatedSummary.keyPoints.slice(0, 3),
                  fullSummary: updatedSummary,
                  transcription: editableTranscription || m.transcription,
                  tags: tags
                };
              }
              return m;
            });
            localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
          }
        }
      } else {
        // No ID means this is a new meeting - save it
        await saveMeetingToDatabase(
          updatedSummary,
          date,
          duration ? parseInt(duration, 10) * 60 : 2700,
          user.id,
          editableTranscription,
          tags
        );
      }
      
      // Update summary state
      setSummary(updatedSummary);
      
      // Update transcription if changed
      if (editableTranscription !== null) {
        sessionStorage.setItem("transcription", editableTranscription);
      }
      
      // Save to sessionStorage too
      sessionStorage.setItem("meetingSummary", JSON.stringify(updatedSummary));
      
      setIsEditing(false);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Changes saved",
        description: "Your meeting summary has been updated"
      });
    } catch (error: any) {
      console.error("Error updating meeting:", error);
      toast({
        title: "Error saving changes",
        description: error.message || "An error occurred while saving changes",
        variant: "destructive"
      });
    }
  };

  const handleCopyToClipboard = () => {
    if (!summary) return;
    
    // Format the summary for clipboard
    const formattedSummary = `
# ${editableTitle}
${date} - ${duration}

## Key Discussion Points
${editableKeyPoints.map(point => `- ${point}`).join('\n')}

## Decisions Made
${editableDecisions.map(decision => `- ${decision}`).join('\n')}

## Action Items
${actionItems.map(item => {
  let text = `- [${item.completed ? 'x' : ' '}] ${item.text}`;
  if (item.responsible) text += ` (${item.responsible})`;
  if (item.dueDate) text += ` - Due: ${item.dueDate}`;
  return text;
}).join('\n')}
    `;

    navigator.clipboard.writeText(formattedSummary).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "Summary copied to clipboard successfully"
        });
      },
      (err) => {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard",
          variant: "destructive"
        });
        console.error('Could not copy text: ', err);
      }
    );
  };

  const handleShare = async () => {
    if (!summary) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: summary.title,
          text: `Meeting summary for ${summary.title}`
          // We would add a URL in a real app
          // url: window.location.href
        });
        toast({
          title: "Shared successfully",
          description: "Meeting summary was shared"
        });
      } else {
        setIsLinkDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not share the summary",
        variant: "destructive"
      });
      console.error("Error sharing:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(
      () => {
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard"
        });
        setIsLinkDialogOpen(false);
      },
      (err) => {
        toast({
          title: "Copy failed",
          description: "Could not copy link",
          variant: "destructive"
        });
      }
    );
  };
  
  const handleSendEmail = (email: string) => {
    // In a real app, this would be handled by a backend API
    if (!email) {
      toast({
        title: "Missing email",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate sending email
    toast({
      title: "Sending email",
      description: `Sending summary to ${email}`
    });
    
    // Simulate success after a delay
    setTimeout(() => {
      toast({
        title: "Email sent",
        description: `Summary sent to ${email}`
      });
      setShareEmail("");
      setIsEmailDialogOpen(false);
    }, 1500);
  };

  // Export to PDF function
  const exportToPdf = async () => {
    if (!summaryRef.current || !summary) return;
    
    toast({
      title: "Creating PDF",
      description: "Preparing your summary for download..."
    });
    
    try {
      // Set up PDF document to improve formatting
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add custom styling
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text(summary.title, 20, 20);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(`${date} - ${duration}`, 20, 30);
      
      // Key Discussion Points
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Key Discussion Points", 20, 45);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      let yPosition = 55;
      summary.keyPoints.forEach(point => {
        pdf.text(`• ${point}`, 25, yPosition);
        yPosition += 10;
      });
      
      // Decisions Made
      yPosition += 5;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Decisions Made", 20, yPosition);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      yPosition += 10;
      summary.decisions.forEach(decision => {
        pdf.text(`• ${decision}`, 25, yPosition);
        yPosition += 10;
      });
      
      // Action Items
      yPosition += 5;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Action Items", 20, yPosition);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      yPosition += 10;
      
      actionItems.forEach(item => {
        const checkbox = item.completed ? "☑" : "☐";
        let actionText = `${checkbox} ${item.text}`;
        pdf.text(actionText, 25, yPosition);
        yPosition += 6;
        
        // Add responsible person and due date on indented next line if they exist
        if (item.responsible || item.dueDate) {
          let detailText = "";
          if (item.responsible) detailText += `Responsible: ${item.responsible}`;
          if (item.responsible && item.dueDate) detailText += " | ";
          if (item.dueDate) detailText += `Due: ${item.dueDate}`;
          
          pdf.text(detailText, 30, yPosition);
          yPosition += 10;
        } else {
          yPosition += 4; // Less spacing if no details
        }
      });
      
      pdf.save(`${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.pdf`);
      
      toast({
        title: "PDF downloaded",
        description: "Summary has been exported to PDF"
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Could not create PDF file",
        variant: "destructive"
      });
    }
  };

  // Export to DOCX function
  const downloadAsDocx = () => {
    if (!summary) return;
    
    toast({
      title: "Creating DOCX",
      description: "Preparing your summary for download..."
    });
    
    try {
      // Create a blob with formatted content (simplified HTML that Word can open)
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              h2 { color: #444; margin-top: 20px; }
              .action-item { margin-bottom: 10px; }
              .action-details { margin-left: 20px; font-style: italic; }
              .completed { text-decoration: line-through; color: #888; }
            </style>
          </head>
          <body>
            <h1>${summary.title}</h1>
            <p>${date} - ${duration}</p>
            
            <h2>Key Discussion Points</h2>
            <ul>
              ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
            
            <h2>Decisions Made</h2>
            <ul>
              ${summary.decisions.map(decision => `<li>${decision}</li>`).join('')}
            </ul>
            
            <h2>Action Items</h2>
            <ul>
              ${actionItems.map(item => {
                let details = '';
                if (item.responsible || item.dueDate) {
                  details = '<div class="action-details">';
                  if (item.responsible) details += `Responsible: ${item.responsible}`;
                  if (item.responsible && item.dueDate) details += ' | ';
                  if (item.dueDate) details += `Due: ${item.dueDate}`;
                  details += '</div>';
                }
                
                return `
                  <li class="action-item ${item.completed ? 'completed' : ''}">
                    ${item.text}
                    ${details}
                  </li>
                `;
              }).join('')}
            </ul>
          </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "DOCX downloaded",
        description: "Summary has been exported as DOCX"
      });
    } catch (error) {
      console.error("DOCX export error:", error);
      toast({
        title: "Export failed",
        description: "Could not create DOCX file",
        variant: "destructive"
      });
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) {
      toast({
        title: "Download failed",
        description: "Audio file not available",
        variant: "destructive"
      });
      return;
    }
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'meeting-recording.webm'; // Default filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Downloading audio",
      description: "Your audio recording is being downloaded"
    });
  };

  const downloadRawText = () => {
    if (!transcription) {
      toast({
        title: "Download failed",
        description: "Transcript not available",
        variant: "destructive"
      });
      return;
    }
    
    // Create a Blob with the text content
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloading transcript",
      description: "Your transcript is being downloaded as text"
    });
  };

  const handleToggleEditMode = () => {
    if (isAuthenticated) {
      setIsEditing(!isEditing);
      
      if (isEditing) {
        setHasUnsavedChanges(false);
      }
    } else {
      toast({
        title: "Authentication required",
        description: "Please sign in to edit meeting summaries",
        variant: "destructive"
      });
    }
  };

  const handleMoveToCategory = () => {
    if (!meetingId && summary && isAuthenticated && user) {
      // This is a new meeting that hasn't been saved yet
      // We need to save it first to get an ID
      saveMeetingToDatabase(
        {
          ...summary,
          tags: tags
        },
        date,
        duration ? parseInt(duration, 10) * 60 : 2700,
        user.id,
        transcription,
        tags
      ).then((newId) => {
        if (newId) {
          // Now we can open the move dialog with the new ID
          setIsMoveToFolderOpen(true);
        }
      });
    } else {
      // Existing meeting - just open the dialog
      setIsMoveToFolderOpen(true);
    }
  };

  return {
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
  };
};
