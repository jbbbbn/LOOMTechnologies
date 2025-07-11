import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Brain, 
  Zap, 
  Calendar,
  FileText,
  Search,
  Mail,
  Image,
  MessageCircle,
  Settings,
  ChevronRight,
  Star
} from "lucide-react";

interface Widget {
  id: string;
  title: string;
  type: "metric" | "progress" | "activity" | "recommendation";
  size: "small" | "medium" | "large";
  enabled: boolean;
  position: number;
}

interface DashboardWidgetsProps {
  userPreferences?: any;
}

export function DashboardWidgets({ userPreferences }: DashboardWidgetsProps) {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "activity-summary", title: "Activity Summary", type: "metric", size: "medium", enabled: true, position: 0 },
    { id: "ai-insights", title: "AI Insights", type: "activity", size: "large", enabled: true, position: 1 },
    { id: "productivity-score", title: "Productivity Score", type: "progress", size: "small", enabled: true, position: 2 },
    { id: "goals-progress", title: "Goals Progress", type: "progress", size: "medium", enabled: true, position: 3 },
    { id: "recommendations", title: "Smart Recommendations", type: "recommendation", size: "large", enabled: true, position: 4 },
    { id: "quick-stats", title: "Quick Stats", type: "metric", size: "small", enabled: true, position: 5 }
  ]);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
    refetchInterval: 30000,
  });

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      {/* Widget Configuration */}
      <Card className="glass-effect border-orange-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Widgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {widgets.map(widget => (
              <Badge 
                key={widget.id}
                variant={widget.enabled ? "default" : "secondary"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => toggleWidget(widget.id)}
              >
                {widget.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enabledWidgets.map(widget => (
          <WidgetRenderer key={widget.id} widget={widget} stats={stats} insights={insights} />
        ))}
      </div>
    </div>
  );
}

interface WidgetRendererProps {
  widget: Widget;
  stats: any;
  insights: any;
}

function WidgetRenderer({ widget, stats, insights }: WidgetRendererProps) {
  const getWidgetSize = (size: string) => {
    switch (size) {
      case "small": return "md:col-span-1";
      case "medium": return "md:col-span-2";
      case "large": return "md:col-span-3";
      default: return "md:col-span-1";
    }
  };

  const renderWidget = () => {
    switch (widget.id) {
      case "activity-summary":
        return <ActivitySummaryWidget stats={stats} />;
      case "ai-insights":
        return <AIInsightsWidget insights={insights} />;
      case "productivity-score":
        return <ProductivityScoreWidget stats={stats} />;
      case "goals-progress":
        return <GoalsProgressWidget stats={stats} />;
      case "recommendations":
        return <RecommendationsWidget stats={stats} />;
      case "quick-stats":
        return <QuickStatsWidget stats={stats} />;
      default:
        return <div>Unknown widget</div>;
    }
  };

  return (
    <div className={`${getWidgetSize(widget.size)} scale-in interactive-card`}>
      {renderWidget()}
    </div>
  );
}

function ActivitySummaryWidget({ stats }: { stats: any }) {
  const activities = [
    { name: "Notes", count: stats?.notes || 0, icon: FileText, color: "text-blue-600" },
    { name: "Events", count: stats?.events || 0, icon: Calendar, color: "text-green-600" },
    { name: "Searches", count: stats?.searches || 0, icon: Search, color: "text-purple-600" },
    { name: "Emails", count: stats?.emails || 0, icon: Mail, color: "text-red-600" },
    { name: "Media", count: stats?.media || 0, icon: Image, color: "text-orange-600" },
  ];

  return (
    <Card className="h-full glass-effect border-orange-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Activity Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {activities.map(activity => (
            <div key={activity.name} className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <activity.icon className={`w-6 h-6 mx-auto mb-2 ${activity.color}`} />
              <div className="text-2xl font-bold">{activity.count}</div>
              <div className="text-sm text-gray-600">{activity.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AIInsightsWidget({ insights }: { insights: any }) {
  return (
    <Card className="h-full glass-effect border-orange-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-orange-600" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">Smart Recommendation</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Based on your recent activity, consider organizing your notes with tags for better searchability.
            </p>
          </div>
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="font-medium">Goal Tracking</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You're on track with your productivity goals. Keep up the great work!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductivityScoreWidget({ stats }: { stats: any }) {
  const totalActivities = (stats?.notes || 0) + (stats?.events || 0) + (stats?.searches || 0) + (stats?.emails || 0);
  const score = Math.min(Math.round((totalActivities / 20) * 100), 100);

  return (
    <Card className="h-full glass-effect border-orange-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Productivity Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">{score}%</div>
          <Progress value={score} className="mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {score >= 80 ? "Excellent productivity!" : score >= 60 ? "Good progress!" : "Keep going!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalsProgressWidget({ stats }: { stats: any }) {
  const goals = [
    { name: "Daily Notes", current: stats?.notes || 0, target: 5, color: "bg-blue-500" },
    { name: "Events Scheduled", current: stats?.events || 0, target: 3, color: "bg-green-500" },
    { name: "Searches Made", current: stats?.searches || 0, target: 10, color: "bg-purple-500" },
  ];

  return (
    <Card className="h-full glass-effect border-orange-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          Goals Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map(goal => (
            <div key={goal.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{goal.name}</span>
                <span>{goal.current}/{goal.target}</span>
              </div>
              <Progress value={(goal.current / goal.target) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationsWidget({ stats }: { stats: any }) {
  const recommendations = [
    {
      title: "Try the Gallery",
      description: "Upload and organize your media files",
      icon: Image,
      action: "Open Gallery",
      priority: "high"
    },
    {
      title: "Schedule More Events",
      description: "Better time management with calendar planning",
      icon: Calendar,
      action: "Add Event",
      priority: "medium"
    },
    {
      title: "Explore Chat",
      description: "Connect with others in real-time",
      icon: MessageCircle,
      action: "Join Chat",
      priority: "low"
    }
  ];

  return (
    <Card className="h-full glass-effect border-orange-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <rec.icon className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{rec.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="button-bounce">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatsWidget({ stats }: { stats: any }) {
  const totalItems = (stats?.notes || 0) + (stats?.events || 0) + (stats?.searches || 0) + (stats?.emails || 0) + (stats?.media || 0);
  
  return (
    <Card className="h-full glass-effect border-orange-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{totalItems}</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Items</p>
          <div className="mt-3 text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}