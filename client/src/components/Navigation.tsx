import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { 
  StickyNote, 
  Calendar, 
  Search, 
  Mail, 
  MessageCircle, 
  Images, 
  Home,
  Bell,
  User,
  LogOut,
  Bot,
  Menu,
  Settings
} from "lucide-react";
import loomLogo from "@assets/LOOM_logo_2_1752244843559.jpg";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/ai", label: "AI Assistant", icon: Bot },
    { path: "/notes", label: "Notes", icon: StickyNote },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/search", label: "Search", icon: Search },
    { path: "/mail", label: "Mail", icon: Mail },
    { path: "/chat", label: "Chat", icon: MessageCircle },
    { path: "/gallery", label: "Gallery", icon: Images },
  ];

  return (
    <header className="glass-effect border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 slide-in">
              <img 
                src={loomLogo} 
                alt="LOOM" 
                className="w-10 h-10 rounded-xl object-cover shadow-lg hover:scale-110 smooth-transition"
              />
              <span className="text-xl font-bold loom-text-gradient">LOOM</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className={`
                      rounded-xl smooth-transition hover-lift
                      ${isActive 
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" 
                        : "hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm"
                      }
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link href={item.path} className="flex items-center space-x-2 scale-in">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 glass-effect">
                <div className="flex flex-col space-y-3 mt-8">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        asChild
                        className={`
                          justify-start rounded-xl smooth-transition
                          ${isActive 
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" 
                            : "hover:bg-white/50 dark:hover:bg-gray-800/50"
                          }
                        `}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={item.path} className="flex items-center space-x-3 scale-in">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="sm" className="hidden sm:flex rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50">
              <Bell className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50">
              <Link href="/settings">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
            
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block font-medium">
                  {user.username || user.firstName || user.email?.split('@')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
