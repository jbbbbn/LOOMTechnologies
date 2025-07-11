import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  StickyNote, 
  Calendar, 
  Search, 
  Mail, 
  MessageCircle, 
  Images, 
  Home,
  Bell,
  User
} from "lucide-react";
import loomLogo from "@assets/LOOM_logo_2_1752244843559.jpg";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/notes", label: "Notes", icon: StickyNote },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/search", label: "Search", icon: Search },
    { path: "/mail", label: "Mail", icon: Mail },
    { path: "/chat", label: "Chat", icon: MessageCircle },
    { path: "/gallery", label: "Gallery", icon: Images },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <img 
                src={loomLogo} 
                alt="LOOM" 
                className="w-10 h-10 rounded-lg object-cover"
              />
            </div>
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className={isActive ? "bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]" : ""}
                  >
                    <a href={item.path} className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </a>
                  </Button>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
