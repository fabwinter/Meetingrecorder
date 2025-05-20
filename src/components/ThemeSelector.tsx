
import { useState } from "react";
import { Check, Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ColorOption = {
  value: string;
  label: string;
  color: string;
};

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "coloured", label: "Coloured" },
];

const colorOptions: ColorOption[] = [
  { value: "default", label: "Default", color: "bg-blue-500" },
  { value: "blue", label: "Blue", color: "bg-gradient-to-b from-blue-300 to-blue-600" },
  { value: "red", label: "Red", color: "bg-gradient-to-b from-red-300 to-red-600" },
  { value: "purple", label: "Purple", color: "bg-gradient-to-b from-purple-300 to-purple-600" },
  { value: "magenta", label: "Magenta", color: "bg-gradient-to-b from-pink-300 to-purple-500" },
  { value: "teal", label: "Teal", color: "bg-gradient-to-b from-teal-300 to-teal-600" },
  { value: "green", label: "Green", color: "bg-gradient-to-b from-green-300 to-green-600" },
  { value: "yellow", label: "Yellow", color: "bg-gradient-to-b from-yellow-300 to-yellow-500" },
  { value: "orange", label: "Orange", color: "bg-gradient-to-b from-orange-300 to-orange-600" },
];

export const ThemeSelector = () => {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (value: string) => {
    setTheme(value as "light" | "dark" | "coloured");
    toast({
      title: `${value.charAt(0).toUpperCase() + value.slice(1)} mode activated`,
      description: `Switched to ${value} mode`,
    });
  };

  const handleColorChange = (value: string) => {
    setColorScheme(value as "default" | "blue" | "red" | "purple" | "magenta" | "teal" | "green" | "yellow" | "orange");
    toast({
      title: `Color scheme updated`,
      description: `Switched to ${value} theme`,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-9 h-9 relative"
          aria-label="Change theme"
        >
          <Palette size={18} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4">
        <Tabs defaultValue="theme">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="theme" className="flex-1">Mode</TabsTrigger>
            <TabsTrigger value="color" className="flex-1">Color</TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme">
            <div className="space-y-4">
              <h4 className="text-sm font-medium leading-none mb-3">Choose mode</h4>
              <RadioGroup 
                value={theme} 
                onValueChange={handleThemeChange}
                className="flex flex-col gap-3"
              >
                {themeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`theme-${option.value}`} />
                    <Label htmlFor={`theme-${option.value}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="color">
            <div className="space-y-4">
              <h4 className="text-sm font-medium leading-none mb-3">Choose color</h4>
              <div className="grid grid-cols-3 gap-3">
                {colorOptions.map((option) => (
                  <div key={option.value} className="text-center">
                    <button
                      onClick={() => handleColorChange(option.value)}
                      className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center border border-border mx-auto mb-1",
                        option.color
                      )}
                      aria-label={option.label}
                    >
                      {colorScheme === option.value && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <span className="text-xs">{option.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
