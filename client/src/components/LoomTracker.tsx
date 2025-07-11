import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
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
  duration: number;
  startTime?: string;
  endTime?: string;
  date: string;
  icon?: string;
  notes?: string;
}

interface MoodEntry {
  id: number;
  userId: number;
  mood: string;
  emoji: string;
  note?: string;
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

  const { data: moodEntries = [] } = useQuery({
    queryKey: ["/api/mood"],
    refetchInterval: 30000,
  });

  const timeMutation = useMutation({
    mutationFn: async (entry: {
      activity: string;
      duration: number;
      startTime: string;
      endTime: string;
      date: string;
      icon: string;
      notes?: string;
    }) => {
      const response = await apiRequest("POST", "/api/time-tracking", entry);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking"] });
      toast({
        title: "Success",
        description: "Time entry saved successfully!",
      });
    },
    onError: (error) => {
      console.error("Time tracking error:", error);
      toast({
        title: "Error",
        description: "Failed to save time entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const moodMutation = useMutation({
    mutationFn: async ({ mood, emoji, note }: { mood: string; emoji: string; note?: string }) => {
      const response = await apiRequest("POST", "/api/mood", { mood, emoji, note });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      toast({
        title: "Success",
        description: "Mood saved successfully!",
      });
    },
    onError: (error) => {
      console.error("Mood tracking error:", error);
      toast({
        title: "Error",
        description: "Failed to save mood. Please try again.",
        variant: "destructive",
      });
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
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000); // in minutes
      
      if (duration > 0) {
        timeMutation.mutate({
          activity: currentActivity,
          duration,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          date: new Date().toISOString().split('T')[0],
          icon: activityPresets.find(a => a.name === currentActivity)?.icon || "⏰"
        });
      }
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
    if (!moodEntries || moodEntries.length === 0) return null;
    const today = new Date().toDateString();
    return moodEntries.find((mood: MoodEntry) => 
      new Date(mood.createdAt).toDateString() === today
    );
  };

  const currentMood = getCurrentMood();

  if (isNavBar) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="relative rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50">
            <Activity className="w-4 h-4" />
            {currentActivity && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            )}
            {currentMood && (
              <div className="absolute -bottom-1 -right-1 text-xs">{currentMood.emoji}</div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>LOOM Tracker</DialogTitle>
            <DialogDescription>
              Track your activities and mood throughout the day
            </DialogDescription>
          </DialogHeader>
          <TrackerContent
            currentActivity={currentActivity}
            elapsedTime={elapsedTime}
            startActivity={startActivity}
            stopActivity={stopActivity}
            formatTime={formatTime}
            getTodaysTotal={getTodaysTotal}
            currentMood={currentMood}
            moodMutation={moodMutation}
            customActivity={customActivity}
            setCustomActivity={setCustomActivity}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-4">
      <TrackerContent
        currentActivity={currentActivity}
        elapsedTime={elapsedTime}
        startActivity={startActivity}
        stopActivity={stopActivity}
        formatTime={formatTime}
        getTodaysTotal={getTodaysTotal}
        currentMood={currentMood}
        moodMutation={moodMutation}
        customActivity={customActivity}
        setCustomActivity={setCustomActivity}
      />
    </div>
  );
}

interface TrackerContentProps {
  currentActivity: string | null;
  elapsedTime: number;
  startActivity: (activity: string) => void;
  stopActivity: () => void;
  formatTime: (seconds: number) => string;
  getTodaysTotal: () => number;
  currentMood: MoodEntry | null;
  moodMutation: any;
  customActivity: string;
  setCustomActivity: (activity: string) => void;
}

function TrackerContent({
  currentActivity,
  elapsedTime,
  startActivity,
  stopActivity,
  formatTime,
  getTodaysTotal,
  currentMood,
  moodMutation,
  customActivity,
  setCustomActivity,
}: TrackerContentProps) {
  return (
    <div className="space-y-4">
      {/* Current Activity */}
      {currentActivity && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    {currentActivity}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {formatTime(elapsedTime)}
                  </p>
                </div>
              </div>
              <Button
                onClick={stopActivity}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Start Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {activityPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => startActivity(preset.name)}
                disabled={!!currentActivity}
                className="flex items-center gap-2 p-3 h-auto"
              >
                <preset.lucideIcon className="w-4 h-4" />
                <span className="text-sm">{preset.name}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Custom activity..."
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && customActivity.trim()) {
                  startActivity(customActivity.trim());
                  setCustomActivity("");
                }
              }}
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
        </CardContent>
      </Card>

      {/* Mood Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Today's Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMood ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentMood.emoji}</span>
              <span className="font-medium">{currentMood.mood}</span>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {moods.map((mood) => (
                <Button
                  key={mood.name}
                  variant="outline"
                  onClick={() => moodMutation.mutate({ mood: mood.name, emoji: mood.emoji })}
                  className={`${mood.color} flex flex-col items-center gap-1 p-3 h-auto`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs">{mood.name}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Total Active Time:</span>
            <Badge variant="secondary">
              {Math.floor(getTodaysTotal() / 60)}h {getTodaysTotal() % 60}m
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}