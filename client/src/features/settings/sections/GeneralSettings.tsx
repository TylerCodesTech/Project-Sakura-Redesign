import { Palette, Bell, Settings2, Globe, Moon, Sun, Upload, Save, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsHeader, SettingsCard, SettingsRow } from "../components";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface GeneralSettingsProps {
  subsection?: string;
}

export function GeneralSettings({ subsection }: GeneralSettingsProps) {
  const isBranding = subsection === "branding";
  const isNotifications = subsection === "notifications";
  const { settings, updateSettings, isLoading } = useSystemSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocal = (key: keyof typeof localSettings, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File, type: "logo" | "favicon") => {
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
      updateLocal(type === "logo" ? "logoUrl" : "faviconUrl", url);
      toast({
        title: "File uploaded",
        description: `${type === "logo" ? "Logo" : "Favicon"} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBranding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SettingsHeader
            sectionId="branding"
            title="Branding"
            description="Customize the look and feel of your platform."
          />
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <SettingsCard
          title="Logo & Identity"
          description="Upload your organization's branding assets."
          icon={Palette}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SettingsRow label="Company Name" vertical>
                <Input 
                  placeholder="Acme Inc." 
                  value={localSettings.companyName}
                  onChange={(e) => updateLocal("companyName", e.target.value)}
                />
              </SettingsRow>
              <SettingsRow label="Logo" vertical>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {localSettings.logoUrl ? (
                      <>
                        <img src={localSettings.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-contain border" />
                        <button 
                          onClick={() => updateLocal("logoUrl", "")}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {localSettings.companyName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://example.com/logo.png"
                        value={localSettings.logoUrl}
                        onChange={(e) => updateLocal("logoUrl", e.target.value)}
                        className="flex-1"
                      />
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "logo");
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-2"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </SettingsRow>
            </div>
            <div className="space-y-4">
              <SettingsRow label="Favicon" vertical>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {localSettings.faviconUrl ? (
                      <>
                        <img src={localSettings.faviconUrl} alt="Favicon" className="w-8 h-8 rounded object-contain border" />
                        <button 
                          onClick={() => updateLocal("faviconUrl", "")}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </>
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {localSettings.companyName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://example.com/favicon.png"
                        value={localSettings.faviconUrl}
                        onChange={(e) => updateLocal("faviconUrl", e.target.value)}
                        className="flex-1"
                      />
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "favicon");
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => faviconInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-2"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </SettingsRow>
              <SettingsRow label="Primary Color" vertical>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="w-12 h-10 p-1 cursor-pointer" 
                    value={localSettings.primaryColor}
                    onChange={(e) => updateLocal("primaryColor", e.target.value)}
                  />
                  <Input 
                    value={localSettings.primaryColor}
                    onChange={(e) => updateLocal("primaryColor", e.target.value)}
                    placeholder="#7c3aed" 
                  />
                </div>
              </SettingsRow>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Theme"
          description="Configure default theme and appearance."
          icon={Moon}
        >
          <div className="space-y-4">
            <SettingsRow label="Default Theme" vertical>
              <Select 
                value={localSettings.defaultTheme}
                onValueChange={(value) => updateLocal("defaultTheme", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" /> Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" /> Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4" /> System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="Allow User Override" description="Let users choose their own theme preference.">
              <Switch 
                checked={localSettings.allowUserThemeOverride === "true"}
                onCheckedChange={(checked) => updateLocal("allowUserThemeOverride", checked ? "true" : "false")}
              />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    );
  }

  if (isNotifications) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SettingsHeader
            sectionId="notifications"
            title="Notifications"
            description="Configure platform-wide notification settings."
          />
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <SettingsCard
          title="Email Notifications"
          description="Configure when emails are sent to users."
          icon={Bell}
        >
          <div className="space-y-4">
            <SettingsRow label="New Ticket Assigned" description="Notify agents when assigned a ticket.">
              <Switch 
                checked={localSettings.emailNewTicketAssigned === "true"}
                onCheckedChange={(checked) => updateLocal("emailNewTicketAssigned", checked ? "true" : "false")}
              />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Ticket Updated" description="Notify when ticket status changes.">
              <Switch 
                checked={localSettings.emailTicketUpdated === "true"}
                onCheckedChange={(checked) => updateLocal("emailTicketUpdated", checked ? "true" : "false")}
              />
            </SettingsRow>
            <Separator />
            <SettingsRow label="SLA Warning" description="Alert before SLA breach.">
              <Switch 
                checked={localSettings.emailSLAWarning === "true"}
                onCheckedChange={(checked) => updateLocal("emailSLAWarning", checked ? "true" : "false")}
              />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Weekly Digest" description="Send weekly summary to admins.">
              <Switch 
                checked={localSettings.emailWeeklyDigest === "true"}
                onCheckedChange={(checked) => updateLocal("emailWeeklyDigest", checked ? "true" : "false")}
              />
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="In-App Notifications"
          description="Configure real-time notifications within the platform."
          icon={Bell}
        >
          <div className="space-y-4">
            <SettingsRow label="Desktop Notifications" description="Show browser push notifications.">
              <Switch 
                checked={localSettings.inAppDesktopNotifications === "true"}
                onCheckedChange={(checked) => updateLocal("inAppDesktopNotifications", checked ? "true" : "false")}
              />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Sound Alerts" description="Play sound for new notifications.">
              <Switch 
                checked={localSettings.inAppSoundAlerts === "true"}
                onCheckedChange={(checked) => updateLocal("inAppSoundAlerts", checked ? "true" : "false")}
              />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Notification Badge" description="Show unread count in tab title.">
              <Switch 
                checked={localSettings.inAppNotificationBadge === "true"}
                onCheckedChange={(checked) => updateLocal("inAppNotificationBadge", checked ? "true" : "false")}
              />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SettingsHeader
          sectionId="general"
          title="General Settings"
          description="Platform-wide settings and preferences."
        />
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsCard
          title="Platform"
          description="Basic platform configuration."
          icon={Globe}
        >
          <div className="space-y-4">
            <SettingsRow label="Platform Name" vertical>
              <Input 
                placeholder="My Helpdesk" 
                value={localSettings.platformName}
                onChange={(e) => updateLocal("platformName", e.target.value)}
              />
            </SettingsRow>
            <SettingsRow label="Support Email" vertical>
              <Input 
                placeholder="support@company.com"
                value={localSettings.supportEmail}
                onChange={(e) => updateLocal("supportEmail", e.target.value)}
              />
            </SettingsRow>
            <SettingsRow label="Default Timezone" vertical>
              <Select 
                value={localSettings.defaultTimezone}
                onValueChange={(value) => updateLocal("defaultTimezone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pst">(GMT-08:00) Pacific Time</SelectItem>
                  <SelectItem value="est">(GMT-05:00) Eastern Time</SelectItem>
                  <SelectItem value="utc">(GMT+00:00) UTC</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Localization"
          description="Language and regional settings."
          icon={Globe}
        >
          <div className="space-y-4">
            <SettingsRow label="Default Language" vertical>
              <Select 
                value={localSettings.defaultLanguage}
                onValueChange={(value) => updateLocal("defaultLanguage", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="Date Format" vertical>
              <Select 
                value={localSettings.dateFormat}
                onValueChange={(value) => updateLocal("dateFormat", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="Time Format" vertical>
              <Select 
                value={localSettings.timeFormat}
                onValueChange={(value) => updateLocal("timeFormat", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
