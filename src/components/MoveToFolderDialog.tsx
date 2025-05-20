
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder } from "@/types/folder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MoveToFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  meetingId: string;
  onMoveSuccess?: () => void; // New callback for success
}

export const MoveToFolderDialog = ({ 
  isOpen, 
  onOpenChange,
  meetingId,
  onMoveSuccess
}: MoveToFolderDialogProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserAndFolders();
    }
  }, [isOpen]);

  const fetchUserAndFolders = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage folders",
          variant: "destructive",
        });
        onOpenChange(false);
        return;
      }
      
      setUserId(session.user.id);
      
      // Fetch folders
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("name");
        
      if (error) throw error;
      
      setFolders(data || []);
      
      // Get current folder for this meeting
      const { data: meetingData, error: meetingError } = await supabase
        .from("meetings")
        .select("folder_id")
        .eq("id", meetingId)
        .single();
        
      if (!meetingError && meetingData) {
        setSelectedFolderId(meetingData.folder_id);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Could not load folders",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveToFolder = async () => {
    if (!meetingId || !userId) return;
    
    try {
      setIsSubmitting(true);
      
      const currentDate = new Date().toISOString();
      
      console.log("Updating meeting:", meetingId);
      console.log("Setting folder_id to:", selectedFolderId);
      
      // First, check if the meeting ID is in the localStorage format or UUID format
      const isLocalStorageId = meetingId.startsWith('meeting_');
      
      if (isLocalStorageId) {
        // Handle localStorage meeting
        const storedMeetings = localStorage.getItem("meetings");
        if (storedMeetings) {
          const meetings = JSON.parse(storedMeetings);
          const updatedMeetings = meetings.map((meeting: any) => {
            if (meeting.id === meetingId) {
              return { ...meeting, folder_id: selectedFolderId };
            }
            return meeting;
          });
          localStorage.setItem("meetings", JSON.stringify(updatedMeetings));
          
          // Now try to find this meeting in Supabase by title and user_id 
          // (in case it exists there too but with a different ID)
          const meetingToUpdate = meetings.find((m: any) => m.id === meetingId);
          if (meetingToUpdate) {
            const { data, error } = await supabase
              .from("meetings")
              .select("id")
              .eq("user_id", userId)
              .eq("title", meetingToUpdate.title)
              .maybeSingle();
              
            if (!error && data) {
              // If found in database, update there too
              await supabase
                .from("meetings")
                .update({ folder_id: selectedFolderId })
                .eq("id", data.id)
                .eq("user_id", userId);
            } else if (!error) {
              // If not found in database, create it there
              const meetingToSave = {
                title: meetingToUpdate.title,
                date: meetingToUpdate.date,
                duration: meetingToUpdate.duration,
                user_id: userId,
                folder_id: selectedFolderId,
                full_summary: meetingToUpdate.fullSummary || {}
              };
              
              await supabase
                .from("meetings")
                .insert([meetingToSave]);
            }
          }
        }
      } else {
        // Update meeting with new folder in Supabase (UUID format)
        const { error } = await supabase
          .from("meetings")
          .update({ folder_id: selectedFolderId })
          .eq("id", meetingId)
          .eq("user_id", userId);
          
        if (error) throw error;
      }
      
      toast({
        title: "Meeting moved",
        description: selectedFolderId 
          ? "Meeting moved to selected folder" 
          : "Meeting removed from folder",
      });
      
      if (onMoveSuccess) {
        onMoveSuccess();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error moving meeting:", error);
      toast({
        title: "Error moving meeting",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Category</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : folders.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No categories available. Create categories in the Meetings section.
            </p>
          ) : (
            <div className="space-y-2">
              <Button
                variant={selectedFolderId === null ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedFolderId(null)}
              >
                No Category (Remove from current category)
              </Button>
              
              {folders.map((folder) => (
                <Button
                  key={folder.id}
                  variant={selectedFolderId === folder.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: folder.color }}
                  ></div>
                  {folder.name}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleMoveToFolder}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
