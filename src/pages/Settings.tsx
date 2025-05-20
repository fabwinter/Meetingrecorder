import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useToast } from "@/hooks/use-toast";
import { AppNavigation } from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";
import { 
  LogOut, 
  User, 
  Mail, 
  AlertCircle,
  HelpCircle,
  Settings as SettingsIcon,
  Palette
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, colorScheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null>(null);
  
  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { email } = session.user;
        const metadata = session.user.user_metadata || {};
        
        setUserData({
          firstName: metadata.first_name || '',
          lastName: metadata.last_name || '',
          email: email || '',
        });
      } else {
        // Redirect to sign in if no session
        navigate('/signin');
      }
    };
    
    getUserData();
  }, [navigate]);
  
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) return null;

  const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "User";
  const initials = `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}` || "U";
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header title="Settings" showBackButton={true} />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{fullName}</h2>
            <p className="text-muted-foreground">{userData.email}</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Account</h3>
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <User size={18} className="text-muted-foreground mr-3" />
                  <span>Profile Information</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/profile")}
                >
                  Edit
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <Mail size={18} className="text-muted-foreground mr-3" />
                  <span>Email Settings</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/email-settings")}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Appearance</h3>
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <Palette size={18} className="text-muted-foreground mr-3" />
                  <span>Theme & Colors</span>
                </div>
                <ThemeSelector />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="mb-1 flex items-center">
                    <span>Current Theme</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {theme.charAt(0).toUpperCase() + theme.slice(1)} mode, {colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)} colors
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Preferences</h3>
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <SettingsIcon size={18} className="text-muted-foreground mr-3" />
                  <span>App Settings</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/app-settings")}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Help & Support</h3>
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <HelpCircle size={18} className="text-muted-foreground mr-3" />
                  <span>Help Center</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open('https://help.meetassist.app', '_blank')}
                >
                  Visit
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <AlertCircle size={18} className="text-muted-foreground mr-3" />
                  <span>Report an Issue</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open('mailto:support@meetassist.app')}
                >
                  Contact
                </Button>
              </div>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="mr-2" size={18} />
            {isLoading ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </main>
      
      <AppNavigation />
    </div>
  );
};

export default Settings;
