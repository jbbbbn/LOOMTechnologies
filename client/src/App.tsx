import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import Notes from "@/pages/Notes";
import Calendar from "@/pages/Calendar";
import Search from "@/pages/Search";
import Mail from "@/pages/Mail";
import Chat from "@/pages/Chat";
import Gallery from "@/pages/Gallery";
import Login from "@/pages/Login";
import AIChat from "@/pages/AIChat";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--loom-orange)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your digital consciousness...</p>
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
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/notes" component={Notes} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/search" component={Search} />
        <Route path="/mail" component={Mail} />
        <Route path="/chat" component={Chat} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/ai" component={AIChat} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
