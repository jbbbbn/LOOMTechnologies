import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, Smile, Meh, Frown, Angry } from "lucide-react";

interface MoodEntry {
  id: number;
  userId: number;
  mood: string;
  emoji: string;
  timestamp: string;
  note?: string;
}

interface MoodTrackerProps {
  className?: string;
}

const moods = [
  { name: "Excellent", emoji: "😍", icon: Heart, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
  { name: "Happy", emoji: "😊", icon: Smile, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  { name: "Neutral", emoji: "😐", icon: Meh, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-900/20" },
  { name: "Sad", emoji: "😞", icon: Frown, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { name: "Angry", emoji: "😡", icon: Angry, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" }
];

export default function MoodTracker({ className }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [todaysMood, setTodaysMood] = useState<string | null>(null);

  const { data: moodHistory } = useQuery({
    queryKey: ["/api/mood"],
    refetchInterval: 30000,
  });

  const { data: moodStats } = useQuery({
    queryKey: ["/api/mood/stats"],
    refetchInterval: 30000,
  });

  const moodMutation = useMutation({
    mutationFn: async ({ mood, emoji }: { mood: string; emoji: string }) => {
      return await apiRequest("/api/mood", "POST", { mood, emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood/stats"] });
      setSelectedMood(null);
    },
  });

  useEffect(() => {
    if (moodHistory?.length > 0) {
      const today = new Date().toDateString();
      const todaysEntry = moodHistory.find((entry: MoodEntry) => 
        new Date(entry.timestamp).toDateString() === today
      );
      setTodaysMood(todaysEntry?.mood || null);
    }
  }, [moodHistory]);

  const handleMoodSelect = (mood: any) => {
    setSelectedMood(mood.name);
    moodMutation.mutate({ mood: mood.name, emoji: mood.emoji });
  };

  const getMoodDistribution = () => {
    if (!moodHistory || moodHistory.length === 0) return [];
    
    const distribution = moods.map(mood => {
      const count = moodHistory.filter((entry: MoodEntry) => entry.mood === mood.name).length;
      const percentage = (count / moodHistory.length) * 100;
      return { ...mood, count, percentage };
    });

    return distribution;
  };

  const getWeeklyMoods = () => {
    if (!moodHistory || moodHistory.length === 0) return [];
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return moodHistory.filter((entry: MoodEntry) => 
      new Date(entry.timestamp) > weekAgo
    ).slice(-7);
  };

  const moodDistribution = getMoodDistribution();
  const weeklyMoods = getWeeklyMoods();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Today's Mood Selector */}
      <Card className="glass-effect border-orange-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            How are you feeling today?
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysMood ? (
            <div className="text-center">
              <div className="text-4xl mb-2">
                {moods.find(m => m.name === todaysMood)?.emoji}
              </div>
              <p className="text-lg font-medium">You're feeling {todaysMood.toLowerCase()} today!</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTodaysMood(null)}
                className="mt-2"
              >
                Change Mood
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {moods.map((mood) => (
                <Button
                  key={mood.name}
                  variant="outline"
                  className={`h-20 flex flex-col items-center gap-2 hover:scale-105 transition-transform ${
                    selectedMood === mood.name ? mood.bg : ''
                  }`}
                  onClick={() => handleMoodSelect(mood)}
                  disabled={moodMutation.isPending}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs">{mood.name}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood Statistics */}
      {moodHistory && moodHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mood Distribution */}
          <Card className="glass-effect border-orange-200/50">
            <CardHeader>
              <CardTitle className="text-lg">Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moodDistribution.map((mood) => (
                  <div key={mood.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{mood.emoji}</span>
                        <span>{mood.name}</span>
                      </span>
                      <span className="font-medium">{mood.count}</span>
                    </div>
                    <Progress value={mood.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Mood Timeline */}
          <Card className="glass-effect border-orange-200/50">
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weeklyMoods.length > 0 ? (
                  weeklyMoods.map((entry: MoodEntry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{entry.emoji}</span>
                        <div>
                          <div className="font-medium">{entry.mood}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {index === weeklyMoods.length - 1 ? 'Latest' : `${weeklyMoods.length - index - 1} days ago`}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No mood entries this week. Start tracking your mood!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mood Insights */}
      {moodHistory && moodHistory.length >= 7 && (
        <Card className="glass-effect border-orange-200/50">
          <CardHeader>
            <CardTitle className="text-lg">Mood Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(moodDistribution.find(m => m.name === "Happy")?.percentage || 0)}%
                </div>
                <p className="text-sm text-gray-600">Happy Days</p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {moodHistory.length}
                </div>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(weeklyMoods.length / 7 * 100)}%
                </div>
                <p className="text-sm text-gray-600">Weekly Consistency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}