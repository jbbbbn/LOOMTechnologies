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
  Menu
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
            
            {/* Desktop Navigation */}
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
                    <Link href={item.path} className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        asChild
                        className={`justify-start ${isActive ? "bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]" : ""}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={item.path} className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Bell className="w-4 h-4" />
            </Button>
            
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
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
