
import { ArrowLeft, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu"; 
import { ThemeSelector } from "@/components/ThemeSelector";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const Header = ({ title, showBackButton = false }: HeaderProps) => {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is signed in
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsSignedIn(!!data.session);
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsSignedIn(!!session);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 max-w-md flex items-center">
        <div className="flex-1 flex items-center">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)}
              className="mr-2 rounded-full p-1.5 hover:bg-muted"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-medium">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeSelector />
          
          {isSignedIn ? (
            <UserMenu />
          ) : (
            <div>
              {window.location.pathname !== '/signin' && (
                <Link 
                  to="/signin" 
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
