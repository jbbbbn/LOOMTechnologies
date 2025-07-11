import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Users, Plus, Hash } from "lucide-react";
import { WebSocketClient } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [currentRoom, setCurrentRoom] = useState("general");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: initialMessages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", currentRoom],
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = new WebSocketClient();
    
    wsRef.current.connect((data) => {
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, data.message]);
      }
    });

    setIsConnected(true);

    return () => {
      wsRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current) return;

    wsRef.current.send({
      type: 'chat_message',
      content: message.trim(),
      roomId: currentRoom,
    });

    setMessage("");
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const rooms = [
    { id: "general", name: "General", members: 12 },
    { id: "team", name: "Team", members: 8 },
    { id: "ai-discussion", name: "AI Discussion", members: 24 },
    { id: "random", name: "Random", members: 5 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--loom-orange)] rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">LOOM Chat</h1>
          <Badge variant="outline" className="text-[var(--loom-orange)] border-[var(--loom-orange)]">
            AI Integration Active
          </Badge>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Rooms</span>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={currentRoom === room.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      currentRoom === room.id 
                        ? "bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]" 
                        : ""
                    }`}
                    onClick={() => setCurrentRoom(room.id)}
                  >
                    <Hash className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left">{room.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {room.members}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Most Active</div>
                  <div className="text-xs text-blue-700">2:00 PM - 4:00 PM</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Popular Topic</div>
                  <div className="text-xs text-green-700">AI Discussion</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">Suggestion</div>
                  <div className="text-xs text-orange-700">Join team discussions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <Hash className="w-5 h-5" />
                <span>{rooms.find(r => r.id === currentRoom)?.name}</span>
                <Badge variant="secondary">
                  {rooms.find(r => r.id === currentRoom)?.members} members
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                    <p className="text-gray-600">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-[var(--loom-orange)] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {msg.userId === 1 ? "U" : "A"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {msg.userId === 1 ? "You" : `User ${msg.userId}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    placeholder={`Message #${rooms.find(r => r.id === currentRoom)?.name}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                    disabled={!isConnected}
                  />
                  <Button 
                    type="submit" 
                    disabled={!message.trim() || !isConnected}
                    className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
