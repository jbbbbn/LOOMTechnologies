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
  ArrowRight,
  Bot,
  Sparkles,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { ContextualHelp } from "@/components/ui/contextual-help";

export default function Home() {
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

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["/api/time-tracking"],
    retry: false,
  });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ["/api/mood"],
    retry: false,
  });

  const apps = [
    {
      name: "Notes",
      icon: StickyNote,
      count: notes.length,
      path: "/notes",
      color: "bg-blue-500",
      description: "AI-powered note-taking"
    },
    {
      name: "Calendar",
      icon: Calendar,
      count: events.length,
      path: "/calendar",
      color: "bg-green-500",
      description: "Smart event scheduling"
    },
    {
      name: "Search",
      icon: Search,
      count: searches.length,
      path: "/search",
      color: "bg-purple-500",
      description: "Personalized search history"
    },
    {
      name: "Mail",
      icon: Mail,
      count: emails.length,
      path: "/mail",
      color: "bg-red-500",
      description: "Intelligent email management"
    },
    {
      name: "Chat",
      icon: MessageCircle,
      count: 0,
      path: "/chat",
      color: "bg-yellow-500",
      description: "Real-time messaging"
    },
    {
      name: "Gallery",
      icon: Images,
      count: media.length,
      path: "/gallery",
      color: "bg-pink-500",
      description: "AI-enhanced media organization"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 fade-in">
      {/* Welcome Section */}
      <div className="text-center space-y-4 slide-in">
        <h1 className="text-5xl font-bold loom-text-gradient">
          Welcome to LOOM
        </h1>
        <p className="text-xl text-muted-foreground font-light">
          Your AI clone helper platform
        </p>
        <p className="text-sm text-muted-foreground opacity-70">
          Hello, {user?.username || user?.firstName || user?.email?.split('@')[0]} - Your AI clone is learning from your activities across all apps
        </p>
      </div>

      {/* AI Insights Section */}
      <Card className="glass-effect border-orange-200/50 scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Brain className="h-5 w-5 text-orange-600" />
            <ContextualHelp 
              helpContent={{
                title: "AI Clone Insights",
                content: "Your AI clone analyzes your activities across all LOOM apps to provide personalized insights and recommendations. The more you use the platform, the smarter it becomes!"
              }}
              trigger="hover"
            >
              <span>AI Clone Insights</span>
            </ContextualHelp>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 pb-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">AI Clone Learning Active</span>
          </div>
          
          <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-orange-200/30 backdrop-blur-sm">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {insights?.insights ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: insights.insights
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/#{3}\s*(.*?)(?=\n|$)/g, '<h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">$1</h3>')
                      .replace(/#{2}\s*(.*?)(?=\n|$)/g, '<h2 class="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">$1</h2>')
                      .replace(/#{1}\s*(.*?)(?=\n|$)/g, '<h1 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">$1</h1>')
                  }}
                />
              ) : (
                'Your AI clone is initializing. Start using LOOM apps to build your digital helper profile.'
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app, index) => {
          const Icon = app.icon;
          return (
            <Card key={app.name} className="interactive-card cursor-pointer group border-0 minimal-shadow scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${app.color} text-white shadow-lg group-hover:scale-110 smooth-transition animate-float`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0 px-3 py-1 rounded-full font-medium animate-heartbeat">
                    {app.count}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-orange-600 smooth-transition">{app.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-200 smooth-transition font-light mb-4">{app.description}</p>
                <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 shadow-lg text-white font-medium button-bounce">
                  <Link href={app.path}>
                    Open {app.name}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 smooth-transition" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="glass-effect border-gray-200/50 scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Plus className="h-5 w-5 text-orange-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-3 hover-lift border-0 minimal-shadow bg-white/50 backdrop-blur-sm">
            <Link href="/notes">
              <StickyNote className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-gray-700">Create Note</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-3 hover-lift border-0 minimal-shadow bg-white/50 backdrop-blur-sm">
            <Link href="/calendar">
              <Calendar className="h-6 w-6 text-green-600" />
              <span className="font-medium text-gray-700">Schedule Event</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-3 hover-lift border-0 minimal-shadow bg-white/50 backdrop-blur-sm">
            <Link href="/search">
              <Search className="h-6 w-6 text-purple-600" />
              <span className="font-medium text-gray-700">Search Web</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
            <Link href="/gallery">
              <Images className="h-6 w-6" />
              <span className="font-medium">Upload Media</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* LOOM Tracker Summary */}
      <Card className="glass-effect border-gray-200/50 scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Activity className="h-5 w-5 text-orange-600" />
            LOOM Tracker Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time Tracking */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900 dark:text-orange-100">Today's Activity</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {timeEntries.length > 0 ? (
                  `${Math.floor(timeEntries.reduce((total: number, entry: any) => total + entry.duration, 0) / 60)}h ${timeEntries.reduce((total: number, entry: any) => total + entry.duration, 0) % 60}m`
                ) : (
                  "0h 0m"
                )}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                {timeEntries.length} activities tracked
              </div>
            </div>

            {/* Mood Tracking */}
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-pink-600" />
                <span className="font-medium text-pink-900 dark:text-pink-100">Current Mood</span>
              </div>
              <div className="text-2xl font-bold">
                {moodEntries.length > 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="text-3xl">{moodEntries[moodEntries.length - 1]?.emoji}</span>
                    <span className="text-pink-600">{moodEntries[moodEntries.length - 1]?.mood}</span>
                  </span>
                ) : (
                  <span className="text-gray-500">No mood set</span>
                )}
              </div>
              <div className="text-sm text-pink-700 dark:text-pink-300">
                {moodEntries.length} mood entries
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          {timeEntries.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Recent Activities</h4>
              <div className="space-y-2">
                {timeEntries.slice(-3).map((entry: any) => (
                  <div key={entry.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-lg">{entry.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{entry.activity}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {entry.duration}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notes.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <StickyNote className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  Created {notes.length} notes, including "{notes[0]?.title}"
                </span>
              </div>
            )}
            
            {searches.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Search className="h-4 w-4 text-purple-600" />
                <span className="text-sm">
                  Performed {searches.length} searches, last: "{searches[searches.length - 1]?.query}"
                </span>
              </div>
            )}
            
            {media.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                <Images className="h-4 w-4 text-pink-600" />
                <span className="text-sm">
                  Uploaded {media.length} media files
                </span>
              </div>
            )}
            
            {notes.length === 0 && searches.length === 0 && media.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Start using LOOM apps to see your activity here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}