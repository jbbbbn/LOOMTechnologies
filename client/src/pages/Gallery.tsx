import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Images, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Edit, 
  Trash2,
  Tag,
  Download,
  Calendar,
  FileImage,
  Film,
  Music,
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Media } from "@shared/schema";

export default function Gallery() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: media = [], isLoading } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (mediaData: { 
      filename: string; 
      originalName: string; 
      mimeType: string; 
      size: number; 
      url: string; 
      description?: string; 
      tags?: string[] 
    }) => {
      const response = await apiRequest("POST", "/api/media", mediaData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Media uploaded successfully!" });
      setIsUploadOpen(false);
      resetUploadForm();
    },
    onError: () => {
      toast({ title: "Failed to upload media", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; description?: string; tags?: string[] }) => {
      const response = await apiRequest("PUT", `/api/media/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Media updated successfully!" });
      setIsEditOpen(false);
      resetEditForm();
    },
    onError: () => {
      toast({ title: "Failed to update media", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Media deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete media", variant: "destructive" });
    },
  });

  const resetUploadForm = () => {
    setDescription("");
    setTags("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetEditForm = () => {
    setDescription("");
    setTags("");
    setSelectedMedia(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a mock URL for demo purposes (in real app, you'd upload to cloud storage)
    const mockUrl = URL.createObjectURL(file);
    
    const mediaData = {
      filename: `${Date.now()}_${file.name}`,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: mockUrl,
      description: description.trim() || undefined,
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
    };

    uploadMutation.mutate(mediaData);
  };

  const handleEdit = (media: Media) => {
    setSelectedMedia(media);
    setDescription(media.description || "");
    setTags(media.tags?.join(", ") || "");
    setIsEditOpen(true);
  };

  const handleUpdateMedia = () => {
    if (!selectedMedia) return;

    updateMutation.mutate({
      id: selectedMedia.id,
      description: description.trim() || undefined,
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this media?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (media: Media) => {
    setSelectedMedia(media);
    setIsViewOpen(true);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.startsWith("video/")) return Film;
    if (mimeType.startsWith("audio/")) return Music;
    return FileText;
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === "all" || item.mimeType.startsWith(filterType);
    
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--loom-orange)] rounded-lg flex items-center justify-center">
            <Images className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">LOOM Gallery</h1>
          <Badge variant="outline" className="text-[var(--loom-orange)] border-[var(--loom-orange)]">
            AI Memory Building Active
          </Badge>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
              onClick={resetUploadForm}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: Images, Videos, Audio files
                </p>
              </div>
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <Input
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUploadOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Media</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]" : ""}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]" : ""}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media found</h3>
            <p className="text-gray-600">
              {searchTerm ? "No media matches your search." : "Upload your first media to get started!"}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((item) => {
            const FileIcon = getFileIcon(item.mimeType);
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {item.mimeType.startsWith("image/") ? (
                      <img 
                        src={item.url} 
                        alt={item.originalName}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleView(item)}
                      />
                    ) : (
                      <FileIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm truncate">{item.originalName}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(item.size)}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredMedia.map((item) => {
                const FileIcon = getFileIcon(item.mimeType);
                return (
                  <div key={item.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.mimeType.startsWith("image/") ? (
                        <img 
                          src={item.url} 
                          alt={item.originalName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{item.originalName}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{formatFileSize(item.size)}</span>
                          <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.description}</p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Media Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[800px]">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedia.originalName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center">
                  {selectedMedia.mimeType.startsWith("image/") ? (
                    <img 
                      src={selectedMedia.url} 
                      alt={selectedMedia.originalName}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  ) : selectedMedia.mimeType.startsWith("video/") ? (
                    <video 
                      src={selectedMedia.url} 
                      controls 
                      className="max-w-full max-h-96 rounded-lg"
                    />
                  ) : selectedMedia.mimeType.startsWith("audio/") ? (
                    <audio 
                      src={selectedMedia.url} 
                      controls 
                      className="w-full"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Size:</strong> {formatFileSize(selectedMedia.size)}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedMedia.mimeType}
                  </div>
                  <div>
                    <strong>Uploaded:</strong> {formatDate(selectedMedia.createdAt)}
                  </div>
                  <div>
                    <strong>Filename:</strong> {selectedMedia.filename}
                  </div>
                </div>
                {selectedMedia.description && (
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1 text-gray-600">{selectedMedia.description}</p>
                  </div>
                )}
                {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMedia.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" asChild>
                    <a href={selectedMedia.url} download={selectedMedia.originalName}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewOpen(false);
                      handleEdit(selectedMedia);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Media Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>Edit {selectedMedia.originalName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateMedia}
                    disabled={updateMutation.isPending}
                    className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
                  >
                    Update
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
