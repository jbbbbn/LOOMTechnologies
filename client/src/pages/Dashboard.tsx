import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  StickyNote, 
  Calendar, 
  Search, 
  Mail, 
  MessageCircle, 
  Images,
  TrendingUp,
  Activity,
  Clock,
  User,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: notes = [] } = useQuery({
    queryKey: ["/api/notes"],
    retry: false,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    retry: false,
  });

  const { data: searches = [] } = useQuery({
    queryKey: ["/api/searches"],
    retry: false,
  });

  const { data: emails = [] } = useQuery({
    queryKey: ["/api/emails"],
    retry: false,
  });

  const { data: media = [] } = useQuery({
    queryKey: ["/api/media"],
    retry: false,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
    retry: false,
  });

  const apps = [
    { 
      name: "LOOM Notes", 
      icon: StickyNote, 
      path: "/notes", 
      count: notes.length,
      description: "AI-enhanced note-taking",
      color: "bg-blue-500"
    },
    { 
      name: "LOOM Calendar", 
      icon: Calendar, 
      path: "/calendar", 
      count: events.length,
      description: "Smart scheduling",
      color: "bg-green-500"
    },
    { 
      name: "LOOM Search", 
      icon: Search, 
      path: "/search", 
      count: searches.length,
      description: "Personalized search",
      color: "bg-purple-500"
    },
    { 
      name: "LOOM Mail", 
      icon: Mail, 
      path: "/mail", 
      count: emails.length,
      description: "Intelligent email",
      color: "bg-red-500"
    },
    { 
      name: "LOOM Chat", 
      icon: MessageCircle, 
      path: "/chat", 
      count: 0,
      description: "AI assistant",
      color: "bg-orange-500"
    },
    { 
      name: "LOOM Gallery", 
      icon: Images, 
      path: "/gallery", 
      count: media.length,
      description: "Smart media",
      color: "bg-indigo-500"
    }
  ];

  const totalActivity = notes.length + events.length + searches.length + emails.length + media.length;
  const consciousnessProgress = Math.min((totalActivity / 50) * 100, 100); // 50 activities = 100%

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Welcome Section */}
      <div className="mb-8 slide-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.username || user?.firstName || user?.email?.split('@')[0]}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 font-light">
              Your AI clone is actively learning and evolving to help you better
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-orange-600 border-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
              <Activity className="w-4 h-4 mr-1" />
              AI Learning Active
            </Badge>
          </div>
        </div>
      </div>



      {/* AI Insights */}
      {insights && (
        <Card className="mb-8 glass-effect border-blue-200/50 scale-in">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: insights.insights
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Application Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {apps.map((app, index) => (
          <Card key={app.path} className="interactive-card cursor-pointer group border-0 minimal-shadow scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl ${app.color} flex items-center justify-center shadow-lg group-hover:scale-110 smooth-transition animate-float`}>
                    <app.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold group-hover:text-orange-600 smooth-transition">{app.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-light">{app.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 smooth-transition animate-wiggle" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900 dark:text-white text-glow">{app.count}</div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = app.path}
                  className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium button-bounce"
                >
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="glass-effect border-gray-200/50 scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-lg">
            <Clock className="w-5 h-5 text-gray-500" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalActivity === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Start Your Digital Journey</p>
              <p>Begin using the applications above to start building your digital consciousness</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.slice(0, 3).map((note: any) => (
                <div key={note.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <StickyNote className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">{note.title}</p>
                    <p className="text-sm text-gray-500">Note created</p>
                  </div>
                </div>
              ))}
              {events.slice(0, 3).map((event: any) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">Event scheduled</p>
                  </div>
                </div>
              ))}
              {searches.slice(0, 3).map((search: any) => (
                <div key={search.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Search className="w-5 h-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="font-medium">{search.query}</p>
                    <p className="text-sm text-gray-500">Search performed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}