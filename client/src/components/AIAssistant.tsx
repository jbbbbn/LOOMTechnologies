import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronUp, ChevronDown, Bot, Send, Sparkles, MessageCircle, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('loom-ai-chat-history');
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('loom-ai-chat-history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

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
      const now = Date.now();
      setChatHistory(prev => [
        ...prev,
        { role: "user", content: message, timestamp: now },
        { role: "assistant", content: data.response, timestamp: now + 1 }
      ]);
      setMessage("");
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      chatMutation.mutate(message);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('loom-ai-chat-history');
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
          <Card className="mt-4 w-96 max-h-[500px] glass-effect border-orange-200/50 shadow-2xl hover-lift scale-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-orange-600" />
                  <span className="text-lg font-semibold">LOOM AI Assistant</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Insights */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">{t('aiInsights')}</span>
                </div>
                {insightsLoading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-xl"></div>
                ) : (
                  <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-orange-200/30 backdrop-blur-sm">
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: insights?.insights || "Start using LOOM apps to get personalized insights!"
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Chat Interface */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">{t('aiAssistant')}</span>
                  </div>
                  {chatHistory.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChatHistory}
                      className="text-gray-500 hover:text-red-500 rounded-full"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                <ScrollArea className="h-40 w-full border-0 rounded-xl p-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm" ref={scrollAreaRef}>
                  {chatHistory.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8 font-light">
                      {t('askAnything')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((msg, idx) => (
                        <div key={msg.timestamp || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} slide-in`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-light ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                              : 'bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-600/50'
                          }`}>
                            <div 
                              className="prose prose-sm max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{
                                __html: msg.content
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {chatMutation.isPending && (
                        <div className="flex justify-start">
                          <div className="bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 p-3 rounded-2xl text-sm border border-gray-200/50 dark:border-gray-600/50">
                            <div className="animate-pulse font-light">{t('loading')}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <div className="flex space-x-2">
                  <Input
                    placeholder={t('askAnything')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="rounded-xl border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || chatMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 shadow-lg rounded-xl"
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
