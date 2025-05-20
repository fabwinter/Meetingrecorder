
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

const Folders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [folders, setFolders] = useState<FolderType[]>([]);
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
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user ? { id: session.user.id } : null);
      setIsLoading(false);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ? { id: session.user.id } : null);
      setIsLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFolders();
      fetchMeetingCounts();
    }
  }, [user, isAuthenticated]);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

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

  const fetchMeetingCounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("folder_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach(meeting => {
        if (meeting.folder_id) {
          counts[meeting.folder_id] = (counts[meeting.folder_id] || 0) + 1;
        }
      });

      setFolderCounts(counts);
    } catch (error) {
      console.error("Error fetching meeting counts:", error);
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
        title: "Folder created",
        description: `"${newFolderName}" folder has been created`,
      });

      setFolders([...(data || []), ...folders]);
      setIsDialogOpen(false);
      setNewFolderName("");
      setSelectedColor(FOLDER_COLORS[0].value);
      
      fetchFolders();
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error creating folder",
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
        <Header title="Folders" />
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
        <Header title="Folders" />
        
        <main className="flex-1 container max-w-md mx-auto px-4 py-8 flex flex-col justify-center items-center">
          <div className="text-center space-y-4 max-w-xs mx-auto">
            <h2 className="text-2xl font-bold">Sign in to view folders</h2>
            <p className="text-muted-foreground">Please sign in to access your folders.</p>
            <Button onClick={handleSignIn} className="w-full">Sign In</Button>
          </div>
        </main>
        
        <AppNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header title="Folders" />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Folders</h1>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus size={18} className="mr-1" /> New Folder
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : folders.length > 0 ? (
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
          <div className="text-center py-12 border rounded-lg border-dashed">
            <FolderPlus size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No folders yet</h2>
            <p className="text-muted-foreground mb-4">
              Create folders to organize your meetings
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus size={18} className="mr-1" /> Create a Folder
            </Button>
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Folder Name
              </label>
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
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
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AppNavigation />
    </div>
  );
};

export default Folders;
