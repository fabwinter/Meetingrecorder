
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data.user) {
        toast({
          title: "Successfully signed in",
          description: "Welcome back to MeetAssist!",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error signing in",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Sign In" showBackButton={true} />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your meeting assistant</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                id="email" 
                type="email" 
                className="pl-10"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                className="pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-8 py-6 text-base bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
