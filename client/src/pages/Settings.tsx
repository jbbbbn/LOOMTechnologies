import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  User, 
  Brain, 
  Save,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";

interface UserSettings {
  language: string;
  consciousness: boolean;
  aiInsights: boolean;
  notifications: boolean;
}

interface UserProfile {
  id: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>({
    language: "en",
    consciousness: true,
    aiInsights: true,
    notifications: true
  });
  const [profile, setProfile] = useState<UserProfile>({
    id: 1,
    email: "",
    username: "",
    firstName: "",
    lastName: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('loom-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    onSuccess: (data) => {
      if (data) {
        setProfile(data);
      }
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      localStorage.setItem('loom-settings', JSON.stringify(newSettings));
      return Promise.resolve(newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const response = await apiRequest("PUT", "/api/auth/profile", profileData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleProfileChange = (key: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileSave = () => {
    updateProfileMutation.mutate({
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName
    });
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "ru", name: "Русский" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <SettingsIcon className="w-6 h-6 text-[var(--loom-orange)]" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username"
                value={profile.username || ""}
                onChange={(e) => handleProfileChange("username", e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  value={profile.firstName || ""}
                  onChange={(e) => handleProfileChange("firstName", e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  value={profile.lastName || ""}
                  onChange={(e) => handleProfileChange("lastName", e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <Button 
              onClick={handleProfileSave}
              disabled={updateProfileMutation.isPending}
              className="w-full bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* AI & Consciousness Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>AI & Consciousness</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="consciousness">Digital Consciousness</Label>
                <p className="text-sm text-gray-500">
                  Allow LOOM to build your digital consciousness profile
                </p>
              </div>
              <Switch 
                id="consciousness"
                checked={settings.consciousness}
                onCheckedChange={(checked) => handleSettingChange("consciousness", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="aiInsights">AI Insights</Label>
                <p className="text-sm text-gray-500">
                  Generate personalized insights from your activity
                </p>
              </div>
              <Switch 
                id="aiInsights"
                checked={settings.aiInsights}
                onCheckedChange={(checked) => handleSettingChange("aiInsights", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Smart Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive AI-powered suggestions and reminders
                </p>
              </div>
              <Switch 
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
              />
            </div>

            {settings.consciousness && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-orange-600" />
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Consciousness Active
                  </Badge>
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  Your digital consciousness is learning from your interactions across all LOOM applications.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-500">Platform Version</Label>
                <p>LOOM v2.0.0</p>
              </div>
              <div>
                <Label className="text-gray-500">AI Model</Label>
                <p>Mistral Large Latest</p>
              </div>
              <div>
                <Label className="text-gray-500">Data Storage</Label>
                <p>PostgreSQL Cloud</p>
              </div>
              <div>
                <Label className="text-gray-500">Last Sync</Label>
                <p>Just now</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-gray-500">Connected Apps</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Notes</Badge>
                <Badge variant="outline">Calendar</Badge>
                <Badge variant="outline">Search</Badge>
                <Badge variant="outline">Mail</Badge>
                <Badge variant="outline">Chat</Badge>
                <Badge variant="outline">Gallery</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}