import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail as MailIcon, Plus, Send, Inbox, Star, Archive, Trash2, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Email } from "@shared/schema";

export default function Mail() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const createEmailMutation = useMutation({
    mutationFn: async (emailData: { subject: string; recipient: string; content: string; sender: string }) => {
      const response = await apiRequest("POST", "/api/emails", emailData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      toast({ title: "Email sent successfully!" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to send email", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setSubject("");
    setRecipient("");
    setContent("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !recipient.trim() || !content.trim()) return;

    const emailData = {
      subject: subject.trim(),
      recipient: recipient.trim(),
      content: content.trim(),
      sender: "demo@loom.com",
    };

    createEmailMutation.mutate(emailData);
  };

  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email);
    setIsViewOpen(true);
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.recipient?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--loom-orange)] rounded-lg flex items-center justify-center">
            <MailIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">LOOM Mail</h1>
          <Badge variant="outline" className="text-[var(--loom-orange)] border-[var(--loom-orange)]">
            AI Assistant Active
          </Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="To: recipient@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <Textarea
                placeholder="Write your message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
                  disabled={createEmailMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Inbox className="w-4 h-4 mr-2" />
                  Inbox
                  <Badge variant="secondary" className="ml-auto">
                    {emails.length}
                  </Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Starred
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Trash
                </Button>
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
                  <div className="text-sm font-medium text-blue-900">Response Time</div>
                  <div className="text-xs text-blue-700">Avg: 2.3 hours</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Top Contact</div>
                  <div className="text-xs text-green-700">team@company.com</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">Suggestion</div>
                  <div className="text-xs text-orange-700">Reply to 3 pending emails</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email List */}
        <div className="lg:col-span-3">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Email List */}
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse border-b pb-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-12">
                  <MailIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No emails found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "No emails match your search." : "Your inbox is empty!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className="border-b last:border-b-0 p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewEmail(email)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">
                          {email.sender || email.recipient}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(email.createdAt)}
                        </div>
                      </div>
                      <div className="font-medium text-sm mb-1">{email.subject}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {email.content}
                      </div>
                      <div className="flex items-center mt-2">
                        {!email.isRead && (
                          <Badge variant="secondary" className="mr-2">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedEmail && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEmail.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <strong>From:</strong> {selectedEmail.sender || "You"}
                  </div>
                  <div>
                    <strong>To:</strong> {selectedEmail.recipient || "You"}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDateTime(selectedEmail.createdAt)}
                </div>
                <div className="border-t pt-4">
                  <div className="whitespace-pre-wrap text-sm">
                    {selectedEmail.content}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    Reply
                  </Button>
                  <Button variant="outline">
                    Forward
                  </Button>
                  <Button variant="outline">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
