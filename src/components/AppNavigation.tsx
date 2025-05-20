
import { Link, useLocation } from "react-router-dom";
import { Home, Clock, FolderOpen, Settings } from "lucide-react";

export const AppNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      active: location.pathname === "/"
    },
    {
      name: "History",
      path: "/history",
      icon: Clock,
      active: location.pathname === "/history"
    },
    {
      name: "Meetings",
      path: "/meetings",
      icon: FolderOpen,
      active: location.pathname === "/meetings" || location.pathname.startsWith("/folder/")
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      active: location.pathname === "/settings"
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background">
      <div className="container max-w-md mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 flex-1 ${
                item.active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
