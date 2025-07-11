import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Edit, Trash2, Repeat, Bell, Dumbbell, GraduationCap, Briefcase, Apple } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("personal");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<string>("daily");
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [reminder, setReminder] = useState<number>(15);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: { 
      title: string; 
      description?: string; 
      startTime: string; 
      endTime: string; 
      location?: string;
      category?: string;
      isRecurring?: boolean;
      recurringType?: string;
      recurringDays?: string[];
      recurringEndDate?: string;
      reminder?: number;
    }) => {
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event created successfully!" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setCategory("personal");
    setIsRecurring(false);
    setRecurringType("daily");
    setRecurringDays([]);
    setRecurringEndDate("");
    setReminder(15);
    setSelectedEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    const eventData = {
      title: title.trim(),
      description: description.trim() || undefined,
      startTime,
      endTime,
      location: location.trim() || undefined,
      category,
      isRecurring,
      recurringType: isRecurring ? recurringType : undefined,
      recurringDays: isRecurring ? recurringDays : undefined,
      recurringEndDate: isRecurring && recurringEndDate ? recurringEndDate : undefined,
      reminder,
    };

    createEventMutation.mutate(eventData);
  };

  const getDayEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startTime).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gym': return <Dumbbell className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      case 'school': return <GraduationCap className="w-4 h-4" />;
      case 'diet': return <Apple className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gym': return 'bg-green-100 text-green-800';
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'school': return 'bg-purple-100 text-purple-800';
      case 'diet': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; status?: string }) => {
      const response = await apiRequest("PUT", `/api/events/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update event", variant: "destructive" });
    },
  });

  const handleUpdateEventStatus = (eventId: number, status: string) => {
    updateMutation.mutate({
      id: eventId,
      status: status
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/events/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
    },
  });

  const handleDeleteEvent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--loom-orange)] rounded-lg flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">LOOM Calendar</h1>
          <Badge variant="outline" className="text-[var(--loom-orange)] border-[var(--loom-orange)]">
            AI Scheduling Active
          </Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Event title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Event description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Input
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">
                      <div className="flex items-center">
                        <Dumbbell className="w-4 h-4 mr-2" />
                        Gym & Fitness
                      </div>
                    </SelectItem>
                    <SelectItem value="work">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Work
                      </div>
                    </SelectItem>
                    <SelectItem value="school">
                      <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        School
                      </div>
                    </SelectItem>
                    <SelectItem value="diet">
                      <div className="flex items-center">
                        <Apple className="w-4 h-4 mr-2" />
                        Diet & Nutrition
                      </div>
                    </SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recurring Event Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                  <label htmlFor="recurring" className="text-sm font-medium flex items-center">
                    <Repeat className="w-4 h-4 mr-2" />
                    Recurring Event
                  </label>
                </div>
                
                {isRecurring && (
                  <div className="space-y-3 border-l-2 border-[var(--loom-orange)] pl-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Repeat</label>
                      <Select value={recurringType} onValueChange={setRecurringType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {recurringType === "weekly" && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Repeat on</label>
                        <div className="grid grid-cols-7 gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="flex items-center space-x-1">
                              <Checkbox
                                id={day}
                                checked={recurringDays.includes(day.toLowerCase())}
                                onCheckedChange={(checked) => {
                                  const dayLower = day.toLowerCase();
                                  if (checked) {
                                    setRecurringDays([...recurringDays, dayLower]);
                                  } else {
                                    setRecurringDays(recurringDays.filter(d => d !== dayLower));
                                  }
                                }}
                              />
                              <label htmlFor={day} className="text-xs">{day}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                      <Input
                        type="date"
                        value={recurringEndDate}
                        onChange={(e) => setRecurringEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Reminder */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Reminder
                </label>
                <Select value={reminder.toString()} onValueChange={(value) => setReminder(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No reminder</SelectItem>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="180">3 hours before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
                  disabled={createEventMutation.isPending}
                >
                  Create Event
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-sm p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Simple calendar grid - in a real app, you'd use a proper calendar component */}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const dayEvents = getDayEvents(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isCurrentMonth = date.getMonth() === new Date().getMonth();
                  
                  return (
                    <div
                      key={i}
                      className={`p-2 text-sm border rounded cursor-pointer hover:bg-gray-50 ${
                        isToday ? 'bg-[var(--loom-orange)] text-white' : 
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="font-medium">{date.getDate()}</div>
                      {dayEvents.length > 0 && (
                        <div className="text-xs">
                          {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : getUpcomingEvents().length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getUpcomingEvents().map((event) => (
                    <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{event.title}</div>
                        {event.category && (
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(event.startTime)} at {formatTime(event.startTime)}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-xs text-gray-600 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                      {event.status && event.status !== "pending" && (
                        <div className="flex items-center text-xs mb-2">
                          <Badge variant={event.status === "completed" ? "default" : "secondary"} className="text-xs">
                            {event.status === "completed" && "✓ Completed"}
                            {event.status === "skipped" && "⚠ Skipped"}
                            {event.status === "postponed" && "⏰ Postponed"}
                          </Badge>
                        </div>
                      )}
                      <div className="flex gap-1 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 py-1 h-6"
                          onClick={() => handleUpdateEventStatus(event.id, "completed")}
                        >
                          ✓ Complete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 py-1 h-6"
                          onClick={() => handleUpdateEventStatus(event.id, "skipped")}
                        >
                          ⚠ Skip
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 py-1 h-6"
                          onClick={() => handleUpdateEventStatus(event.id, "postponed")}
                        >
                          ⏰ Postpone
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="text-xs px-2 py-1 h-6"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI Scheduling Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Optimal Meeting Time</div>
                  <div className="text-xs text-blue-700">2:00 PM - 4:00 PM on weekdays</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Productivity Peak</div>
                  <div className="text-xs text-green-700">Morning hours (9-11 AM)</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">Suggestion</div>
                  <div className="text-xs text-orange-700">Block 30 min for deep work daily</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
