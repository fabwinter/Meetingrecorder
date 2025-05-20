
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="rounded-full w-9 h-9"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === "light" ? (
        <Moon size={18} className="text-muted-foreground transition-all" />
      ) : (
        <Sun size={18} className="text-muted-foreground transition-all" />
      )}
    </Button>
  );
};
