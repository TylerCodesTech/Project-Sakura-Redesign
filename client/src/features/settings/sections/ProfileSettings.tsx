import { User, Camera, Mail, Phone, Building2, Save, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SettingsHeader, SettingsCard, SettingsRow } from "../components";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { queryClient } from "@/lib/queryClient";

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setProfile(prev => ({ ...prev, avatar: url }));
      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been uploaded. Click Save to apply changes.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = user && (
    profile.displayName !== (user.displayName || "") ||
    profile.email !== (user.email || "") ||
    profile.phone !== (user.phone || "") ||
    profile.bio !== (user.bio || "") ||
    profile.avatar !== (user.avatar || "")
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SettingsHeader
          sectionId="profile"
          title="Profile"
          description="Manage your personal information and profile picture."
        />
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <SettingsCard
        title="Profile Picture"
        description="Upload a photo to personalize your account."
        icon={Camera}
      >
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-2xl">
                {(profile.displayName || user.username).substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {profile.avatar && (
              <button
                onClick={() => setProfile(prev => ({ ...prev, avatar: "" }))}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90 shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">{profile.displayName || user.username}</h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {user.department}
            </p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Personal Information"
        description="Update your contact details and bio."
        icon={User}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsRow label="Display Name" vertical>
            <Input
              placeholder="Your display name"
              value={profile.displayName}
              onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
            />
          </SettingsRow>
          <SettingsRow label="Email Address" vertical>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your.email@company.com"
                className="pl-10"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </SettingsRow>
          <SettingsRow label="Phone Number" vertical>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="pl-10"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </SettingsRow>
        </div>
        <div className="mt-6">
          <SettingsRow label="Bio" vertical>
            <Textarea
              placeholder="Tell us a bit about yourself..."
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );
}
