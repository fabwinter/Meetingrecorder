import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { AppNavigation } from "@/components/AppNavigation";
import { MeetingCard } from "@/components/MeetingCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Meeting, SupabaseMeeting, transformSupabaseMeetings } from "@/types/recording";
import { Folder } from "@/types/folder";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FOLDER_COLORS } from "@/types/folder";

const FolderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [folder, setFolder] = useState<Folder | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        fetchFolder(session.user.id);
        fetchMeetings(session.user.id);
      } else {
        // If not authenticated, redirect to sign in
        navigate('/signin');
      }
    };
    
    checkAuth();
  }, [id, navigate]);

  const fetchFolder = async (currentUserId: string) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("id", id)
        .eq("user_id", currentUserId)
        .single();

      if (error) throw error;

      setFolder(data);
      setEditName(data.name);
      setEditColor(data.color);
    } catch (error: any) {
      console.error("Error fetching folder:", error);
      toast({
        title: "Error fetching folder",
        description: "The folder you requested could not be found",
        variant: "destructive",
      });
      navigate("/meetings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMeetings = async (currentUserId: string) => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("folder_id", id)
        .eq("user_id", currentUserId);

      if (error) throw error;

      // Transform the data to match our Meeting type
      const transformedMeetings = transformSupabaseMeetings(data as SupabaseMeeting[]);
      setMeetings(transformedMeetings);
    } catch (error: any) {
      console.error("Error fetching meetings:", error);
      toast({
        title: "Error fetching meetings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async () => {
    try {
      // First update meetings to remove folder_id reference
      const { error: updateError } = await supabase
        .from("meetings")
        .update({ folder_id: null })
        .eq("folder_id", id);

      if (updateError) throw updateError;

      // Then delete the folder
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Folder deleted",
        description: "The folder has been successfully deleted",
      });
      
      navigate("/meetings");
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error deleting folder",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteAlertOpen(false);
    }
  };

  const handleUpdateFolder = async () => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({
          name: editName,
          color: editColor,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Folder updated",
        description: "The folder has been successfully updated",
      });
      
      setIsEditDialogOpen(false);
      fetchFolder(userId || '');
    } catch (error: any) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error updating folder",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <Header title="Loading..." showBackButton />
        <main className="flex-1 container max-w-md mx-auto px-4 py-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <AppNavigation />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <Header title="Folder Not Found" showBackButton />
        <main className="flex-1 container max-w-md mx-auto px-4 py-6">
          <p className="text-center">This folder does not exist or you don't have access to it.</p>
          <Button 
            className="mt-4 mx-auto block" 
            onClick={() => navigate('/meetings')}
          >
            Back to Meetings
          </Button>
        </main>
        <AppNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header title={folder.name} showBackButton />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div 
              className="w-6 h-6 rounded-full mr-2" 
              style={{ backgroundColor: folder.color }}
            ></div>
            <h1 className="text-2xl font-bold">{folder.name}</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Pencil size={16} className="mr-2" />
                Edit Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsDeleteAlertOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {meetings.length > 0 ? (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                id={meeting.id}
                title={meeting.title}
                date={meeting.date}
                duration={meeting.duration}
                keyPoints={meeting.full_summary?.keyPoints || []}
                decisions={meeting.full_summary?.decisions || []}
                actionItems={meeting.full_summary?.actionItems || []}
                tags={meeting.full_summary?.tags || []}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg border-dashed">
            <h2 className="text-xl font-medium mb-2">No meetings in this folder</h2>
            <p className="text-muted-foreground mb-4">
              Any meetings you add to this folder will appear here
            </p>
            <Button onClick={() => navigate('/')}>
              Record a New Meeting
            </Button>
          </div>
        )}
      </main>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? The meetings in this folder will not be deleted but will be moved to Uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Folder Name
              </label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Folder Color
              </label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full transition-all ${
                      editColor === color.value
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEditColor(color.value)}
                    type="button"
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateFolder} 
              disabled={!editName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AppNavigation />
    </div>
  );
};

export default FolderDetails;
