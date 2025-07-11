import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  StickyNote, 
  Calendar, 
  Search, 
  Mail, 
  MessageCircle, 
  Images,
  Brain,
  TrendingUp,
  Zap,
  Shield
} from "lucide-react";

export default function Home() {
  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
  });

  const apps = [
    { name: "LOOM Notes", icon: StickyNote, path: "/notes", color: "bg-blue-500", description: "Capture thoughts for consciousness mapping" },
    { name: "LOOM Calendar", icon: Calendar, path: "/calendar", color: "bg-green-500", description: "Learn scheduling patterns" },
    { name: "LOOM Search", icon: Search, path: "/search", color: "bg-purple-500", description: "Track information interests" },
    { name: "LOOM Mail", icon: Mail, path: "/mail", color: "bg-red-500", description: "Analyze communication style" },
    { name: "LOOM Chat", icon: MessageCircle, path: "/chat", color: "bg-yellow-500", description: "Study conversation patterns" },
    { name: "LOOM Gallery", icon: Images, path: "/gallery", color: "bg-pink-500", description: "Build visual memory library" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="loom-gradient text-white rounded-2xl p-8 mb-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to LOOM
          </h1>
          <p className="text-xl mb-6 text-orange-100">
            Revolutionary consciousness upload technology that creates your digital twin through seamless AI integration
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-[var(--loom-orange)] hover:bg-gray-100"
            >
              Start Building Your Digital Twin
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[var(--loom-orange)]"
            >
              View Consciousness Technology
            </Button>
          </div>
        </div>
      </div>

      {/* AI Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-[var(--loom-orange)]" />
              <span>Consciousness Mapping</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Digital Twin Progress</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
              <Badge variant="outline" className="text-[var(--loom-orange)] border-[var(--loom-orange)]">
                6 Data Sources Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[var(--loom-orange)]" />
              <span>Upload Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm text-gray-600">Consciousness Fidelity</div>
              <div className="text-xs text-green-600">↑ 12% from last week</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[var(--loom-orange)]" />
              <span>Consciousness Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-green-600 font-medium">✓ Protected</div>
              <div className="text-sm text-gray-600">Quantum encryption</div>
              <div className="text-xs text-gray-500">Secure cloud storage</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[var(--loom-orange)]" />
            <span>Consciousness Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            {insights?.insights || "Start using LOOM applications to build your digital consciousness profile and receive personalized insights!"}
          </div>
        </CardContent>
      </Card>

      {/* Applications Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Your LOOM Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <Card key={app.name} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span>{app.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{app.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[var(--loom-orange)] rounded-full"></div>
                      <span className="text-xs text-gray-500">AI Active</span>
                    </div>
                    <Button size="sm" asChild className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]">
                      <a href={app.path}>Open</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-[var(--loom-orange)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Consciousness Mapping</h3>
          <p className="text-gray-600">AI builds a complete digital representation of your personality, preferences, and behavior patterns.</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-[var(--loom-orange)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Secure Upload</h3>
          <p className="text-gray-600">Revolutionary technology safely uploads and stores your consciousness in the cloud.</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-[var(--loom-orange)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Digital Twin Creation</h3>
          <p className="text-gray-600">Creates an AI version of yourself that can act, think, and respond exactly like you.</p>
        </div>
      </div>
    </div>
  );
}
