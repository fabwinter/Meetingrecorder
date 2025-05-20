
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Summary from "./pages/Summary";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Meetings from "./pages/Meetings";
import FolderDetails from "./pages/FolderDetails";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { AuthLayout } from "@/components/AuthLayout";

// Create a new query client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" defaultColorScheme="default">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected routes */}
              <Route path="/" element={<AuthLayout><Index /></AuthLayout>} />
              <Route path="/summary" element={<AuthLayout><Summary /></AuthLayout>} />
              <Route path="/history" element={<AuthLayout><History /></AuthLayout>} />
              <Route path="/meetings" element={<AuthLayout><Meetings /></AuthLayout>} />
              <Route path="/folder/:id" element={<AuthLayout><FolderDetails /></AuthLayout>} />
              <Route path="/settings" element={<AuthLayout><Settings /></AuthLayout>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
