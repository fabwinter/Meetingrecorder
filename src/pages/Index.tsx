
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { AppNavigation } from "@/components/AppNavigation";

const Index = () => {
  const [activeTab, setActiveTab] = useState("record");
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header title="MeetAssist" />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Meeting Assistant</h1>
          <p className={isColoredMode ? (isYellowTheme ? "text-black" : "text-white") : "text-muted-foreground"}>
            Record or upload your meetings for AI-powered summaries
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="record" className="pt-6">
            <AudioRecorder />
          </TabsContent>
          <TabsContent value="upload" className="pt-6">
            <AudioUploader />
          </TabsContent>
        </Tabs>
        
        <div className="mt-auto">
          <Link to="/history">
            <Button 
              variant={isColoredMode ? "colored-outline" : "outline"} 
              className="w-full"
            >
              <History size={18} className="mr-2" />
              View Meeting History
            </Button>
          </Link>
        </div>
      </main>
      
      <AppNavigation />
    </div>
  );
};

export default Index;
