import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import { OnboardingProvider } from "@/components/ui/onboarding-tour";
import { SmartHelpSystem } from "@/components/ui/contextual-help";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Notes from "@/pages/Notes";
import Calendar from "@/pages/Calendar";
import Search from "@/pages/Search";
import Mail from "@/pages/Mail";
import Chat from "@/pages/Chat";
import Gallery from "@/pages/Gallery";
import Login from "@/pages/Login";
import AIChat from "@/pages/AIChat";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center fade-in">
        <div className="text-center scale-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-orange-200 dark:border-orange-800 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-2 border-transparent border-t-orange-500 mx-auto mb-6" style={{ animationDuration: '0.8s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-orange-500 animate-ping"></div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-light animate-pulse">Loading your AI clone...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <OnboardingProvider>
      <Layout>
        <SmartHelpSystem />
        <PageTransition>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/notes" component={Notes} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/search" component={Search} />
            <Route path="/mail" component={Mail} />
            <Route path="/chat" component={Chat} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/ai" component={AIChat} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </PageTransition>
      </Layout>
    </OnboardingProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
