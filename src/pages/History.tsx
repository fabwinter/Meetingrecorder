
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MeetingCard } from "@/components/MeetingCard";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { AppNavigation } from "@/components/AppNavigation";
import { Meeting, SupabaseMeeting, transformSupabaseMeetings } from "@/types/recording";
import { supabase } from "@/integrations/supabase/client";
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
import { useToast } from "@/hooks/use-toast";
import { Folder as FolderType } from "@/types/folder";

const History = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [folderMap, setFolderMap] = useState<Record<string, FolderType>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";

  // Get user from Supabase session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        setUser(session?.user ? { id: session.user.id } : null);
        
        if (session?.user) {
          await fetchMeetingsAndFolders();
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ? { id: session.user.id } : null);
      
      if (session?.user) {
        fetchMeetingsAndFolders();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const fetchFolders = async () => {
    try {
      if (!user?.id) return {};
  
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id);
  
      if (error) throw error;
  
      const folderMapping: Record<string, FolderType> = {};
      (data || []).forEach(folder => {
        folderMapping[folder.id] = folder;
      });
  
      return folderMapping;
    } catch (error) {
      console.error("Error fetching folders:", error);
      return {};
    }
  };

  const fetchMeetingsAndFolders = async () => {
    try {
      setIsLoading(true);
      
      // Get current user ID
      if (!user?.id) {
        console.log("No user ID found for fetching meetings");
        setIsLoading(false);
        return;
      }
      
      // Fetch folders first to create a mapping
      const folderMapping = await fetchFolders();
      setFolderMap(folderMapping);
      
      console.log("Fetching meetings for user:", user.id);
      
      // First try to get from Supabase
      const { data: supabaseMeetings, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error("Error fetching meetings from Supabase:", error);
        throw error;
      }
      
      // Initialize our meetings array
      let allMeetings: Meeting[] = [];
      
      // If we have meetings from Supabase
      if (supabaseMeetings && supabaseMeetings.length > 0) {
        console.log("Meetings fetched from Supabase:", supabaseMeetings.length);
        // Transform the data to match our Meeting type
        allMeetings = transformSupabaseMeetings(supabaseMeetings as SupabaseMeeting[]);
      } else {
        console.log("No meetings found in Supabase");
      }
      
      // Fall back to localStorage to get any that might not be in Supabase yet
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        try {
          const parsedStoredMeetings = JSON.parse(storedMeetings);
          
          // Filter for this user's meetings that aren't already in our list
          const localMeetings = parsedStoredMeetings
            .filter((m: any) => (m.userId === user.id || m.user_id === user.id))
            .filter((m: any) => {
              // Don't include if it's already in our list from Supabase
              return !allMeetings.some(dbMeeting => 
                dbMeeting.title === m.title && 
                dbMeeting.date === m.date
              );
            });
          
          if (localMeetings.length > 0) {
            console.log("Found additional local meetings:", localMeetings.length);
            
            // Convert format to match our Meeting type
            const normalizedLocalMeetings = localMeetings.map((m: any) => ({
              id: m.id,
              user_id: m.user_id || m.userId,
              title: m.title,
              date: m.date,
              duration: m.duration,
              folder_id: m.folder_id,
              full_summary: m.full_summary || m.fullSummary || {}
            }));
            
            // Add them to our meetings array
            allMeetings = [...allMeetings, ...normalizedLocalMeetings];
          }
        } catch (error) {
          console.error("Error parsing localStorage meetings:", error);
        }
      }
      
      console.log("Total meetings after combining sources:", allMeetings.length);
      setMeetings(allMeetings);
    } catch (error) {
      console.error("Error loading meeting history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!meetingToDelete) return;

    try {
      // Check if the ID is in uuid format or starts with "meeting_" (localStorage format)
      const isLocalStorageId = meetingToDelete.startsWith('meeting_');
      
      if (!isLocalStorageId) {
        // Delete from Supabase if it's a UUID
        const { error } = await supabase
          .from('meetings')
          .delete()
          .eq('id', meetingToDelete)
          .eq('user_id', user?.id);
        
        if (error) throw error;
      }
      
      // Always update localStorage (to handle both cases)
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        const allMeetings = JSON.parse(storedMeetings);
        const updatedMeetings = allMeetings.filter((meeting: any) => meeting.id !== meetingToDelete);
        localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
      }
      
      // Update local state
      setMeetings(meetings.filter(meeting => meeting.id !== meetingToDelete));
      
      toast({
        title: "Meeting deleted",
        description: "Meeting has been successfully deleted"
      });
    } catch (error: any) {
      console.error("Error deleting meeting:", error);
      toast({
        title: "Error deleting meeting",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setMeetingToDelete(null);
    }
  };

  const handleMoveSuccess = () => {
    // Refresh meetings and folders after a successful move
    fetchMeetingsAndFolders();
  };

  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignIn = () => {
    navigate('/signin');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <Header title="Meeting History" showBackButton={true} />
        <main className="flex-1 container max-w-md mx-auto px-4 py-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <AppNavigation />
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <Header title="Meeting History" showBackButton={true} />
        
        <main className="flex-1 container max-w-md mx-auto px-4 py-8 flex flex-col justify-center items-center">
          <div className="text-center space-y-4 max-w-xs mx-auto">
            <h2 className="text-2xl font-bold">Sign in to view your meetings</h2>
            <p className={isColoredMode ? (isYellowTheme ? "text-black" : "text-white") : "text-muted-foreground"}>
              Please sign in to access your meeting history.
            </p>
            <Button 
              onClick={handleSignIn} 
              className="w-full"
              variant={isColoredMode ? "colored-button" : "default"}
            >
              Sign In
            </Button>
          </div>
        </main>
        
        <AppNavigation />
      </div>
    );
  }

  // Main content view with meetings
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header title="Meeting History" showBackButton={true} />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-9"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredMeetings.length > 0 ? (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => {
              // Find folder data if meeting has a folder_id
              const folder = meeting.folder_id ? folderMap[meeting.folder_id] : null;
              
              return (
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
                  folderName={folder?.name}
                  folderColor={folder?.color}
                  onMoveSuccess={handleMoveSuccess}
                  onDeleteClick={() => setMeetingToDelete(meeting.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className={isColoredMode ? (isYellowTheme ? "text-black" : "text-white") : "text-muted-foreground"}>
              No meetings found
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-primary hover:underline mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </main>
      
      <AlertDialog open={!!meetingToDelete} onOpenChange={(isOpen) => !isOpen && setMeetingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteMeeting}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AppNavigation />
    </div>
  );
};

export default History;
