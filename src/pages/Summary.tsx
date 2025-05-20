
import React, { useEffect, useState } from "react";
import { MeetingSummary } from "@/components/MeetingSummary";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { AppNavigation } from "@/components/AppNavigation";

export const Summary = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user is authenticated using Supabase
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/signin");
          return;
        }
        
        setUserId(session.user.id);
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate("/signin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const userIdObj = userId ? { id: userId } : null;

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header title="Meeting Summary" />
      <main className="container max-w-3xl mx-auto px-4 py-6 flex-1">
        <MeetingSummary user={userIdObj} />
      </main>
      <AppNavigation />
    </div>
  );
};

export default Summary;
