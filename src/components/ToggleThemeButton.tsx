
import { useEffect, useState } from "react";
import { Moon, SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ToggleThemeButton = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    applyTheme(initialTheme);

    // Add a listener for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
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
      className="rounded-full w-9 h-9 relative"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === "light" ? (
        <Moon size={18} className="text-muted-foreground transition-all" />
      ) : (
        <SunMoon size={18} className="text-muted-foreground transition-all" />
      )}
      <span className="sr-only">
        {theme === "light" ? "Dark mode" : "Light mode"}
      </span>
    </Button>
  );
};
