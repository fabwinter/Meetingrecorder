
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ClerkSetupProps {
  onKeySet: (key: string) => void;
}

// Default Clerk key
const DEFAULT_CLERK_KEY = "pk_test_ZWxlZ2FudC1oZXJyaW5nLTE1LmNsZXJrLmFjY291bnRzLmRldiQ";

export const ClerkSetup = ({ onKeySet }: ClerkSetupProps) => {
  const [key, setKey] = useState(DEFAULT_CLERK_KEY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set default key on component mount
  useEffect(() => {
    if (!key) {
      setKey(DEFAULT_CLERK_KEY);
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      setError("Please enter a Clerk publishable key");
      return;
    }
    
    if (!trimmedKey.startsWith("pk_")) {
      setError("Please enter a valid Clerk publishable key starting with 'pk_'");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save to localStorage for persistence
      localStorage.setItem("clerk_publishable_key", trimmedKey);
      
      // Notify parent component
      onKeySet(trimmedKey);
      
      toast({
        title: "Success",
        description: "Your API key has been saved successfully",
      });
      
      setIsLoading(false);
    } catch (err) {
      setError("Failed to save your key. Please try again.");
      setIsLoading(false);
    }
  };
  
  const handleDemoMode = () => {
    window.open("https://clerk.com/", "_blank");
  };
  
  const handleUseDefaultKey = () => {
    setKey(DEFAULT_CLERK_KEY);
    localStorage.setItem("clerk_publishable_key", DEFAULT_CLERK_KEY);
    onKeySet(DEFAULT_CLERK_KEY);
    
    toast({
      title: "Default key applied",
      description: "Using the provided default Clerk key",
    });
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">MeetAssist Setup</CardTitle>
          <CardDescription>
            Enter your Clerk publishable key to enable authentication features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clerk-key">Clerk Publishable Key</Label>
              <Input
                id="clerk-key"
                placeholder="pk_test_..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="font-mono text-sm"
                required
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                You can get your key from the{" "}
                <a 
                  href="https://dashboard.clerk.com/last-active?path=api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  Clerk Dashboard <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save & Continue"}
              </Button>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button type="button" variant="secondary" onClick={handleUseDefaultKey}>
                Use Default Key
              </Button>
              
              <Button type="button" variant="outline" onClick={handleDemoMode}>
                Sign Up for Clerk (Free)
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-center text-muted-foreground">
            Get your free Clerk API key at{" "}
            <a 
              href="https://clerk.com/?utm_source=meetassist"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              clerk.com
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
