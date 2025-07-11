import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, X } from "lucide-react";

interface MoodEntry {
  id: number;
  userId: number;
  mood: string;
  emoji: string;
  createdAt: string;
  note?: string;
}

interface SimpleMoodTrackerProps {
  className?: string;
}

const moods = [
  { name: "Excellent", emoji: "😍", color: "bg-pink-100 hover:bg-pink-200 border-pink-300" },
  { name: "Happy", emoji: "😊", color: "bg-green-100 hover:bg-green-200 border-green-300" },
  { name: "Neutral", emoji: "😐", color: "bg-gray-100 hover:bg-gray-200 border-gray-300" },
  { name: "Sad", emoji: "😞", color: "bg-blue-100 hover:bg-blue-200 border-blue-300" },
  { name: "Angry", emoji: "😡", color: "bg-red-100 hover:bg-red-200 border-red-300" }
];

export default function SimpleMoodTracker({ className }: SimpleMoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [todaysMood, setTodaysMood] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const { data: moodHistory } = useQuery({
    queryKey: ["/api/mood"],
    refetchInterval: 30000,
  });

  const moodMutation = useMutation({
    mutationFn: async ({ mood, emoji }: { mood: string; emoji: string }) => {
      return await apiRequest("/api/mood", "POST", { mood, emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      setSelectedMood(null);
    },
  });

  useEffect(() => {
    if (moodHistory?.length > 0) {
      const today = new Date().toDateString();
      const todaysEntry = moodHistory.find((entry: MoodEntry) => 
        new Date(entry.createdAt).toDateString() === today
      );
      setTodaysMood(todaysEntry?.mood || null);
    }
  }, [moodHistory]);

  const handleMoodSelect = (mood: any) => {
    setSelectedMood(mood.name);
    moodMutation.mutate({ mood: mood.name, emoji: mood.emoji });
  };

  const getRecentMoods = () => {
    if (!moodHistory || moodHistory.length === 0) return [];
    return moodHistory.slice(-5).reverse();
  };

  const recentMoods = getRecentMoods();

  if (!isVisible) return null;

  return (
    <div className={`${className} relative`}>
      <Card className="glass-card hover-lift transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold gradient-text flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              How are you feeling?
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {todaysMood ? (
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border">
              <div className="text-4xl mb-2">
                {moods.find(m => m.name === todaysMood)?.emoji}
              </div>
              <p className="text-lg font-medium text-gray-800">
                You're feeling <span className="text-orange-600">{todaysMood.toLowerCase()}</span> today!
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTodaysMood(null)}
                className="mt-2 border-orange-200 hover:bg-orange-50"
              >
                Change Mood
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-600">Select your current mood:</p>
              <div className="grid grid-cols-5 gap-2">
                {moods.map((mood) => (
                  <Button
                    key={mood.name}
                    variant="outline"
                    className={`h-16 flex flex-col items-center gap-1 transition-all duration-200 ${mood.color} ${
                      selectedMood === mood.name ? 'scale-110 shadow-lg' : ''
                    }`}
                    onClick={() => handleMoodSelect(mood)}
                    disabled={moodMutation.isPending}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.name}</span>
                  </Button>
                ))}
              </div>
              {moodMutation.isPending && (
                <div className="text-center text-sm text-gray-500">
                  Saving your mood...
                </div>
              )}
            </div>
          )}
          
          {recentMoods.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recent Moods</h4>
              <div className="flex flex-wrap gap-2">
                {recentMoods.map((mood: MoodEntry, index: number) => (
                  <Badge
                    key={mood.id}
                    variant="secondary"
                    className="flex items-center gap-1 py-1"
                  >
                    <span>{mood.emoji}</span>
                    <span className="text-xs">
                      {new Date(mood.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}