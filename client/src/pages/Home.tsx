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
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Welcome to LOOM
        </h1>
        <p className="text-xl text-muted-foreground">
          Your consciousness uploading and digital twin platform
        </p>
        <p className="text-sm text-muted-foreground">
          Hello, {user?.email} - Your AI is learning from your activities across all apps
        </p>
      </div>

      {/* AI Insights Section */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-orange-600" />
            AI Consciousness Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">Digital Twin Learning Active</span>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-orange-200">
            <p className="text-sm text-gray-700">
              {insights?.insights || "Your AI is initializing. Start using LOOM apps to build your digital consciousness profile."}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Consciousness Upload Progress</span>
            </div>
            <Badge variant="secondary">
              {Math.min(100, ((notes.length + events.length + searches.length + emails.length + media.length) * 5))}%
            </Badge>
          </div>
          
          <Progress 
            value={Math.min(100, ((notes.length + events.length + searches.length + emails.length + media.length) * 5))} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <Card key={app.name} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${app.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary">{app.count}</Badge>
                </div>
                <CardTitle className="text-lg">{app.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{app.description}</p>
                <Button asChild className="w-full group-hover:bg-orange-500 group-hover:text-white">
                  <Link href={app.path}>
                    Open App
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
            <Link href="/notes">
              <StickyNote className="h-6 w-6" />
              <span className="font-medium">Create Note</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
            <Link href="/calendar">
              <Calendar className="h-6 w-6" />
              <span className="font-medium">Schedule Event</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
            <Link href="/search">
              <Search className="h-6 w-6" />
              <span className="font-medium">Search Web</span>
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