import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Activity, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Heart, 
  Tv, 
  Dumbbell, 
  Briefcase, 
  BookOpen, 
  Coffee,
  Plus,
  Timer
} from "lucide-react";

interface TimeEntry {
  id: number;
  userId: number;
  activity: string;
  duration: number; // in minutes
  startTime: string;
  endTime?: string;
  date: string;
  icon: string;
}

interface MoodEntry {
  id: number;
  userId: number;
  mood: string;
  emoji: string;
  createdAt: string;
}

interface LoomTrackerProps {
  isNavBar?: boolean;
}

const activityPresets = [
  { name: "Watched TV", icon: "📺", lucideIcon: Tv, color: "bg-blue-100 text-blue-700" },
  { name: "Exercise", icon: "🏋️", lucideIcon: Dumbbell, color: "bg-green-100 text-green-700" },
  { name: "Work", icon: "💼", lucideIcon: Briefcase, color: "bg-purple-100 text-purple-700" },
  { name: "Study", icon: "📚", lucideIcon: BookOpen, color: "bg-orange-100 text-orange-700" },
  { name: "Reading", icon: "📖", lucideIcon: BookOpen, color: "bg-yellow-100 text-yellow-700" },
  { name: "Break", icon: "☕", lucideIcon: Coffee, color: "bg-gray-100 text-gray-700" },
];

const moods = [
  { name: "Excellent", emoji: "😍", color: "bg-pink-100 hover:bg-pink-200" },
  { name: "Happy", emoji: "😊", color: "bg-green-100 hover:bg-green-200" },
  { name: "Neutral", emoji: "😐", color: "bg-gray-100 hover:bg-gray-200" },
  { name: "Sad", emoji: "😞", color: "bg-blue-100 hover:bg-blue-200" },
  { name: "Angry", emoji: "😡", color: "bg-red-100 hover:bg-red-200" }
];

export default function LoomTracker({ isNavBar = false }: LoomTrackerProps) {
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [customActivity, setCustomActivity] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["/api/time-tracking"],
    refetchInterval: 30000,
  });

  const { data: todaysMood } = useQuery({
    queryKey: ["/api/mood"],
    refetchInterval: 30000,
  });

  const timeMutation = useMutation({
    mutationFn: async (entry: any) => {
      return await apiRequest("/api/time-tracking", "POST", entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking"] });
    },
  });

  const moodMutation = useMutation({
    mutationFn: async ({ mood, emoji }: { mood: string; emoji: string }) => {
      return await apiRequest("/api/mood", "POST", { mood, emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentActivity && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentActivity, startTime]);

  const startActivity = (activity: string) => {
    const now = new Date();
    setCurrentActivity(activity);
    setStartTime(now);
    setElapsedTime(0);
  };

  const stopActivity = () => {
    if (currentActivity && startTime) {
      const duration = Math.floor((Date.now() - startTime.getTime()) / 60000); // in minutes
      
      timeMutation.mutate({
        activity: currentActivity,
        duration,
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        icon: activityPresets.find(a => a.name === currentActivity)?.icon || "⏰"
      });
    }
    
    setCurrentActivity(null);
    setStartTime(null);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodaysTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return timeEntries
      .filter((entry: TimeEntry) => entry.date === today)
      .reduce((total: number, entry: TimeEntry) => total + entry.duration, 0);
  };

  const getCurrentMood = () => {
    if (!todaysMood || todaysMood.length === 0) return null;
    const today = new Date().toDateString();
    return todaysMood.find((mood: MoodEntry) => 
      new Date(mood.createdAt).toDateString() === today
    );
  };

  const currentMood = getCurrentMood();

  if (isNavBar) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>LOOM Tracker</span>
            {currentActivity && (
              <Badge variant="secondary" className="ml-2">
                {formatTime(elapsedTime)}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>LOOM Tracker</DialogTitle>
          </DialogHeader>
          <LoomTrackerContent
            currentActivity={currentActivity}
            elapsedTime={elapsedTime}
            startActivity={startActivity}
            stopActivity={stopActivity}
            customActivity={customActivity}
            setCustomActivity={setCustomActivity}
            getTodaysTotal={getTodaysTotal}
            currentMood={currentMood}
            moodMutation={moodMutation}
            formatTime={formatTime}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-600" />
          LOOM Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoomTrackerContent
          currentActivity={currentActivity}
          elapsedTime={elapsedTime}
          startActivity={startActivity}
          stopActivity={stopActivity}
          customActivity={customActivity}
          setCustomActivity={setCustomActivity}
          getTodaysTotal={getTodaysTotal}
          currentMood={currentMood}
          moodMutation={moodMutation}
          formatTime={formatTime}
        />
      </CardContent>
    </Card>
  );
}

function LoomTrackerContent({
  currentActivity,
  elapsedTime,
  startActivity,
  stopActivity,
  customActivity,
  setCustomActivity,
  getTodaysTotal,
  currentMood,
  moodMutation,
  formatTime
}: any) {
  return (
    <div className="space-y-6">
      {/* Current Activity */}
      {currentActivity ? (
        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {formatTime(elapsedTime)}
          </div>
          <p className="text-lg font-medium text-gray-800 mb-3">
            Currently: {currentActivity}
          </p>
          <Button onClick={stopActivity} variant="destructive" size="sm">
            <Square className="w-4 h-4 mr-2" />
            Stop Activity
          </Button>
        </div>
      ) : (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Timer className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No activity being tracked</p>
        </div>
      )}

      {/* Quick Start Activities */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Quick Start</h4>
        <div className="grid grid-cols-2 gap-2">
          {activityPresets.map((activity) => (
            <Button
              key={activity.name}
              variant="outline"
              className={`flex items-center gap-2 h-12 ${activity.color}`}
              onClick={() => startActivity(activity.name)}
              disabled={!!currentActivity}
            >
              <activity.lucideIcon className="w-4 h-4" />
              <span className="text-sm">{activity.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Activity */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Custom Activity</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom activity..."
            value={customActivity}
            onChange={(e) => setCustomActivity(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              if (customActivity.trim()) {
                startActivity(customActivity.trim());
                setCustomActivity("");
              }
            }}
            disabled={!customActivity.trim() || !!currentActivity}
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Today's Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">
              {Math.floor(getTodaysTotal() / 60)}h {getTodaysTotal() % 60}m
            </div>
            <p className="text-sm text-blue-700">Total Time</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {currentMood?.emoji || "😐"}
            </div>
            <p className="text-sm text-green-700">Current Mood</p>
          </div>
        </div>
      </div>

      {/* Mood Quick Update */}
      {!currentMood && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Log Your Mood</h4>
          <div className="flex gap-2">
            {moods.map((mood) => (
              <Button
                key={mood.name}
                variant="outline"
                className={`flex-1 ${mood.color}`}
                onClick={() => moodMutation.mutate({ mood: mood.name, emoji: mood.emoji })}
              >
                <span className="text-lg">{mood.emoji}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}