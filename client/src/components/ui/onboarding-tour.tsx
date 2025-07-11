import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, X, Sparkles, Bot, StickyNote, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to LOOM!",
    content: "LOOM is your AI clone helper platform. Let's take a quick tour to get you started!",
    icon: Sparkles,
  },
  {
    id: "ai-assistant",
    title: "Meet Your AI Assistant",
    content: "Your AI clone learns from everything you do in LOOM. The more you use the apps, the smarter it becomes!",
    icon: Bot,
    action: "Click the AI Assistant button to start chatting"
  },
  {
    id: "notes",
    title: "Smart Notes",
    content: "Create notes and let your AI clone learn from your thoughts and ideas. It will help you remember and connect information.",
    icon: StickyNote,
    action: "Try creating your first note"
  },
  {
    id: "calendar",
    title: "Intelligent Calendar",
    content: "Schedule events and your AI clone will learn your patterns to suggest better time management.",
    icon: Calendar,
    action: "Add an event to get started"
  },
  {
    id: "search",
    title: "Personal Search",
    content: "Your search history helps your AI clone understand your interests and provide better recommendations.",
    icon: Search,
    action: "Try searching for something"
  },
  {
    id: "complete",
    title: "You're All Set!",
    content: "Start using LOOM apps to build your AI clone. The more you interact, the more personalized your experience becomes!",
    icon: Sparkles,
    action: "Start exploring"
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => {
    if (isLastStep) {
      setIsVisible(false);
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTour = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-orange-200/50 shadow-2xl scale-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <currentStepData.icon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {currentStep + 1} of {tourSteps.length}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 font-light leading-relaxed">
              {currentStepData.content}
            </p>
            
            {currentStepData.action && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200/50">
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  💡 {currentStepData.action}
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            
            <div className="flex space-x-2">
              {!isLastStep && (
                <Button
                  variant="ghost"
                  onClick={skipTour}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip Tour
                </Button>
              )}
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center space-x-2"
              >
                <span>{isLastStep ? "Get Started" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('loom-onboarding-completed');
    if (!hasCompletedOnboarding) {
      // Show tour after a short delay
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('loom-onboarding-completed', 'true');
    setShowTour(false);
  };

  return (
    <>
      {children}
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
    </>
  );
}