import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, HelpCircle, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface HelpBubbleProps {
  title: string;
  content: string;
  show: boolean;
  onClose: () => void;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function HelpBubble({ title, content, show, onClose, position = "top", className }: HelpBubbleProps) {
  if (!show) return null;

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2", 
    left: "right-full mr-2",
    right: "left-full ml-2"
  };

  return (
    <Card className={cn(
      "absolute z-50 w-80 shadow-xl border-orange-200/50 glass-effect scale-in",
      positionClasses[position],
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-light">{content}</p>
      </CardContent>
    </Card>
  );
}

interface ContextualHelpProps {
  children: React.ReactNode;
  helpContent: {
    title: string;
    content: string;
  };
  trigger?: "hover" | "click" | "auto";
  delay?: number;
}

export function ContextualHelp({ children, helpContent, trigger = "hover", delay = 1000 }: ContextualHelpProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (trigger === "auto" && !hasShown) {
      const timer = setTimeout(() => {
        setShowHelp(true);
        setHasShown(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay, hasShown]);

  const handleInteraction = () => {
    if (trigger === "click") {
      setShowHelp(!showHelp);
    } else if (trigger === "hover") {
      setShowHelp(true);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={trigger === "hover" ? handleInteraction : undefined}
        onMouseLeave={trigger === "hover" ? () => setShowHelp(false) : undefined}
        onClick={trigger === "click" ? handleInteraction : undefined}
      >
        {children}
      </div>
      <HelpBubble
        title={helpContent.title}
        content={helpContent.content}
        show={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}

export function SmartHelpSystem() {
  const [location] = useLocation();
  const [currentHelp, setCurrentHelp] = useState<{ title: string; content: string } | null>(null);

  const helpContent = {
    "/": {
      title: "Welcome to LOOM!",
      content: "This is your dashboard. Click on any app card to start building your AI clone with your activities and data."
    },
    "/ai": {
      title: "AI Assistant",
      content: "Chat with your AI clone! It learns from all your activities across LOOM apps and provides personalized responses."
    },
    "/notes": {
      title: "Smart Notes",
      content: "Create notes that your AI clone can learn from. Add tags and let the AI analyze your content for insights."
    },
    "/calendar": {
      title: "Intelligent Calendar",
      content: "Schedule events and let your AI clone learn your patterns to suggest better time management."
    },
    "/search": {
      title: "Personal Search",
      content: "Your search history helps your AI clone understand your interests and provide better recommendations."
    },
    "/mail": {
      title: "AI-Enhanced Mail",
      content: "Manage emails while your AI clone learns your communication patterns for smarter assistance."
    },
    "/chat": {
      title: "LOOM Chat",
      content: "Connect with others while your AI clone learns from your conversations to improve its personality."
    },
    "/gallery": {
      title: "Smart Gallery",
      content: "Upload media and let your AI clone learn from your visual preferences and memories."
    },
    "/settings": {
      title: "Customize Your Experience",
      content: "Control how your AI clone learns, set preferences, and customize your LOOM experience."
    }
  };

  useEffect(() => {
    const help = helpContent[location as keyof typeof helpContent];
    if (help) {
      setCurrentHelp(help);
      // Show help for 3 seconds when navigating to a new page
      const timer = setTimeout(() => setCurrentHelp(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  if (!currentHelp) return null;

  return (
    <div className="fixed top-20 right-4 z-40">
      <HelpBubble
        title={currentHelp.title}
        content={currentHelp.content}
        show={true}
        onClose={() => setCurrentHelp(null)}
        position="bottom"
      />
    </div>
  );
}