import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronUp, ChevronDown, Bot, Send, Sparkles, MessageCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/ai/insights"],
    enabled: isOpen,
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: data.response }
      ]);
      setMessage("");
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      chatMutation.mutate(message);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            size="lg"
            className="loom-gradient shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-14 h-14"
          >
            <Bot className="w-6 h-6 text-white" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-4 w-96 max-h-[500px] shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-[var(--loom-orange)]" />
                  <span>LOOM AI Assistant</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Insights */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[var(--loom-orange)]" />
                  <span className="text-sm font-medium">AI Insights</span>
                </div>
                {insightsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {insights?.insights || "Start using LOOM apps to get personalized insights!"}
                  </div>
                )}
              </div>

              {/* Chat Interface */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-[var(--loom-orange)]" />
                  <span className="text-sm font-medium">Chat with AI</span>
                </div>
                
                <ScrollArea className="h-40 w-full border rounded-lg p-3">
                  {chatHistory.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8">
                      Ask me anything about your LOOM data!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                            msg.role === 'user' 
                              ? 'bg-[var(--loom-orange)] text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask your AI assistant..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || chatMutation.isPending}
                    className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Learning Status */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>AI Learning Active</span>
                <Badge variant="outline" className="text-[var(--loom-orange)] border-[var(--loom-orange)]">
                  6 Apps Connected
                </Badge>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
