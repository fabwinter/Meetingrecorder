import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { AppNavigation } from "@/components/AppNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, FolderPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Folder as FolderType, FOLDER_COLORS } from "@/types/folder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Meeting, SupabaseMeeting, transformSupabaseMeetings } from "@/types/recording";

const Meetings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [unassignedMeetings, setUnassignedMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});

  // Get user from Supabase session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        setUser(session?.user ? { id: session.user.id } : null);
        
        if (session?.user) {
          await fetchFolders();
          await fetchMeetingsData();
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
        fetchFolders();
        fetchMeetingsData();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        console.log("No user ID available for fetching folders");
        return;
      }
      
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        throw error;
      }

      console.log("Folders fetched:", data);
      setFolders(data || []);
    } catch (error: any) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error fetching folders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMeetingsData = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch meetings from Supabase
      const { data: supabaseMeetings, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      let allMeetings: Meeting[] = [];
      
      // Transform Supabase meetings
      if (supabaseMeetings && supabaseMeetings.length > 0) {
        allMeetings = transformSupabaseMeetings(supabaseMeetings as SupabaseMeeting[]);
      }
      
      // Try to get any localStorage meetings
      const storedMeetingsString = localStorage.getItem('meetings');
      if (storedMeetingsString) {
        try {
          const storedMeetings = JSON.parse(storedMeetingsString);
          
          // Only include meetings for this user that aren't already in Supabase
          const localMeetings = storedMeetings
            .filter((m: any) => m.userId === user.id || m.user_id === user.id)
            .filter((m: any) => {
              // Check if this meeting exists in Supabase already
              return !allMeetings.some(dbMeeting => 
                dbMeeting.title === m.title && 
                dbMeeting.date === m.date
              );
            });
            
          // Normalize localMeetings to match Meeting type
          const normalizedLocalMeetings = localMeetings.map((m: any) => {
            return {
              id: m.id,
              user_id: m.user_id || m.userId,
              title: m.title,
              date: m.date,
              duration: m.duration,
              folder_id: m.folder_id,
              full_summary: m.full_summary || m.fullSummary || {}
            };
          });
          
          // Merge all meetings
          allMeetings = [...allMeetings, ...normalizedLocalMeetings];
        } catch (e) {
          console.error("Error parsing localStorage meetings:", e);
        }
      }
      
      console.log("All meetings fetched:", allMeetings.length);
      
      // Count meetings per folder
      const counts: Record<string, number> = {};
      const unassigned: Meeting[] = [];
      
      allMeetings.forEach(meeting => {
        if (meeting.folder_id) {
          counts[meeting.folder_id] = (counts[meeting.folder_id] || 0) + 1;
        } else {
          unassigned.push(meeting);
        }
      });

      setFolderCounts(counts);
      setUnassignedMeetings(unassigned);
    } catch (error) {
      console.error("Error fetching meetings data:", error);
      toast({
        title: "Error loading meetings",
        description: "Could not load your meetings",
        variant: "destructive"
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user) return;

    try {
      const { data, error } = await supabase.from("folders").insert([
        {
          name: newFolderName.trim(),
          color: selectedColor,
          user_id: user.id,
        },
      ]).select();

      if (error) throw error;

      toast({
        title: "Category created",
        description: `"${newFolderName}" category has been created`,
      });

      setIsDialogOpen(false);
      setNewFolderName("");
      setSelectedColor(FOLDER_COLORS[0].value);
      
      // Refresh data
      await fetchFolders();
      await fetchMeetingsData();
      
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFolderClick = (folderId: string) => {
    navigate(`/folder/${folderId}`);
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <Header title="Meetings" />
        <main className="flex-1 container max-w-md mx-auto px-4 py-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <AppNavigation />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <Header title="Meetings" />
        
        <main className="flex-1 container max-w-md mx-auto px-4 py-8 flex flex-col justify-center items-center">
          <div className="text-center space-y-4 max-w-xs mx-auto">
            <h2 className="text-2xl font-bold">Sign in to view categories</h2>
            <p className="text-muted-foreground">Please sign in to access your meeting categories.</p>
            <Button onClick={handleSignIn} className="w-full">Sign In</Button>
          </div>
        </main>
        
        <AppNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header title="Meetings" />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Meeting Categories</h1>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus size={18} className="mr-1" /> New Category
          </Button>
        </div>

        {/* Unassigned Meetings Section */}
        {unassignedMeetings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Uncategorized Meetings</h2>
            <div className="space-y-3">
              {unassignedMeetings.map(meeting => (
                <Card 
                  key={meeting.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <h3 className="font-medium">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">{meeting.date}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigate(`/summary?id=${meeting.id}`);
                      }}
                    >
                      View Meeting
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Folder list */}
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-3">Your Categories</h2>
          {folders.length > 0 ? (
            <div className="space-y-3">
              {folders.map((folder) => (
                <Card 
                  key={folder.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 rounded-md" style={{ backgroundColor: folder.color }}>
                        <Folder size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{folder.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {folderCounts[folder.id] || 0} meetings
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg border-dashed">
              <FolderPlus size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No categories yet</h2>
              <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
                Create categories to organize your meetings
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus size={18} className="mr-1" /> Create a Category
              </Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Category Color
              </label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor === color.value
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    type="button"
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AppNavigation />
    </div>
  );
};

export default Meetings;
