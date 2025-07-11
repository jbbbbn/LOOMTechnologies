import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Circle, 
  Search,
  Hash,
  Plus,
  Settings,
  Phone,
  Video,
  MoreVertical
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { WebSocketClient } from "@/lib/websocket";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  roomId: string;
}

interface Room {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'public';
  members: string[];
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}

export default function Chat() {
  const [activeRoom, setActiveRoom] = useState<string>("general");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocketClient | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock rooms for demo - in real app, these would come from API
  const rooms: Room[] = [
    { id: "general", name: "General", type: "public", members: ["user1", "user2", "user3"], lastMessage: "Welcome to LOOM Chat!", lastActivity: "2 min ago" },
    { id: "consciousness-tech", name: "Consciousness Tech", type: "public", members: ["user1", "user4"], lastMessage: "Latest upload progress...", lastActivity: "5 min ago" },
    { id: "ai-development", name: "AI Development", type: "public", members: ["user2", "user3"], lastMessage: "New AI model released", lastActivity: "1 hour ago" },
    { id: "direct-john", name: "John Smith", type: "direct", members: ["user1"], lastMessage: "Hey there!", lastActivity: "10 min ago", unreadCount: 2 },
    { id: "direct-sarah", name: "Sarah Johnson", type: "direct", members: ["user2"], lastMessage: "Meeting at 3 PM", lastActivity: "30 min ago" },
  ];

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", activeRoom],
    enabled: !!activeRoom,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; roomId: string }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", activeRoom] });
      setMessage("");
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  // WebSocket connection
  useEffect(() => {
    if (!wsRef.current) {
      wsRef.current = new WebSocketClient();
      wsRef.current.connect((data) => {
        if (data.type === 'message' && data.roomId === activeRoom) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", activeRoom] });
        }
      });
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [activeRoom, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      content: message.trim(),
      roomId: activeRoom,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentRoom = rooms.find(r => r.id === activeRoom);
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--loom-orange)] rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">LOOM Chat</h1>
          <Badge variant="outline" className="text-[var(--loom-orange)] border-[var(--loom-orange)]">
            Real-time Communication
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            {currentRoom?.members.length || 0} members
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar - Room List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Rooms</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-1">
                  {filteredRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room.id)}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                        activeRoom === room.id ? 'bg-[var(--loom-orange)]/10 border-r-2 border-[var(--loom-orange)]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {room.type === 'direct' ? (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.name}`} />
                            <AvatarFallback>{room.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Hash className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm truncate">{room.name}</h3>
                            {room.unreadCount && (
                              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {room.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                          <p className="text-xs text-gray-400">{room.lastActivity}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {currentRoom?.type === 'direct' ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRoom.name}`} />
                      <AvatarFallback>{currentRoom.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold">{currentRoom?.name}</h2>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Circle className="w-2 h-2 text-green-500 mr-1 fill-current" />
                      {currentRoom?.members.length} members online
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-400px)] p-4" ref={scrollRef}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg mb-2">Start a conversation</p>
                      <p className="text-sm">Be the first to send a message in this room.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`} />
                          <AvatarFallback>{msg.sender.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm">{msg.sender}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1 break-words">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder={`Message ${currentRoom?.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="sm"
                  className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}