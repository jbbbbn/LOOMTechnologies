import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  User, 
  Send, 
  Brain, 
  Sparkles, 
  MessageSquare,
  Activity,
  TrendingUp,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const interruptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/interrupt", {});
      return response.json();
    },
    onSuccess: () => {
      setIsLoading(false);
      toast({ title: "AI processing interrupted" });
    },
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.response, 
        timestamp: new Date() 
      }]);
      setIsLoading(false);
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
      setIsLoading(false);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { 
      role: "user", 
      content: userMessage, 
      timestamp: new Date() 
    }]);
    setInput("");
    setIsLoading(true);
    
    chatMutation.mutate(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What do you know about me?",
    "What can you help me with?",
    "Show me my activity patterns",
    "Help me organize my notes",
    "Suggest calendar improvements"
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">LOOM AI Assistant</h1>
            <p className="text-muted-foreground">Your personal AI that learns from your activities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Learning Active</span>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                {insights?.insights || "Start using LOOM apps to see personalized insights here."}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Activity Trends
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Smart Suggestions
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat with AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages */}
              <ScrollArea className="h-96 w-full rounded-md border p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg mb-2">Welcome to LOOM AI!</p>
                    <p className="text-sm">Start a conversation by asking me anything about your LOOM activities.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-orange-500' : 'bg-muted'}`}>
                            {message.role === 'user' ? (
                              <User className="h-4 w-4 text-white" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-orange-500 text-white' : 'bg-muted'}`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-orange-100' : 'text-muted-foreground'}`}>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="p-2 rounded-full bg-muted">
                          <Bot className="h-4 w-4 animate-pulse" />
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-sm">Thinking...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Suggested Questions */}
              {messages.length === 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Try asking:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(question)}
                        className="text-xs"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your LOOM activities..."
                  disabled={isLoading}
                />
                {isLoading ? (
                  <Button
                    onClick={() => interruptMutation.mutate()}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Stop
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}