import { Palette, Bell, Settings2, Globe, Building2, Languages, Mail, Share2, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsCard, SettingsRow } from "../components";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface GeneralSettingsProps {
  subsection?: string;
}

export function GeneralSettings({ subsection }: GeneralSettingsProps) {
  const isBranding = subsection?.startsWith("branding");
  const isNotifications = subsection?.startsWith("notifications");
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
    // Render specific branding subsection
    if (subsection === "branding-logo") {
      return (
        <div className="space-y-6">
          <SettingsCard
            title="Logo & Favicon"
            description="Upload your brand's visual identity elements"
            icon={Palette}
            scope="global"
            helpText="Recommended: Logo 200x60px, Favicon 32x32px"
          >
            <div className="space-y-6">
              <SettingsRow 
                label="Logo (Light Mode)" 
                description="Displayed on light backgrounds"
              >
                <div className="flex items-center gap-3">
                  {localSettings.logoUrl && (
                    <img 
                      src={localSettings.logoUrl} 
                      alt="Company Logo" 
                      className="h-8 max-w-24 object-contain border rounded"
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
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
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Logo (Dark Mode)" 
                description="Displayed on dark backgrounds (optional)"
              >
                <Input
                  value={localSettings.logoDarkUrl || ""}
                  onChange={(e) => updateLocal("logoDarkUrl", e.target.value)}
                  placeholder="https://cdn.yourcompany.com/logo-dark.png"
                  className="max-w-sm"
                />
              </SettingsRow>

              <SettingsRow 
                label="Favicon" 
                description="Site icon shown in browser tabs"
              >
                <div className="flex items-center gap-3">
                  {localSettings.faviconUrl && (
                    <img 
                      src={localSettings.faviconUrl} 
                      alt="Favicon" 
                      className="w-6 h-6 object-contain border rounded"
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
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
                </div>
              </SettingsRow>

              {hasChanges && (
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </SettingsCard>
        </div>
      );
    }

    if (subsection === "branding-colors") {
      return (
        <div className="space-y-6">
          <SettingsCard
            title="Colors & Themes"
            description="Customize your brand colors and theme preferences"
            icon={Palette}
            scope="global"
          >
            <div className="space-y-6">
              <SettingsRow 
                label="Primary Brand Color" 
                description="Main color used throughout the application"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white shadow-md cursor-pointer"
                    style={{ backgroundColor: localSettings.primaryColor }}
                    onClick={() => document.getElementById('primary-color-picker')?.click()}
                  />
                  <Input
                    id="primary-color-picker"
                    type="color"
                    value={localSettings.primaryColor}
                    onChange={(e) => updateLocal("primaryColor", e.target.value)}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                  <Input
                    type="text"
                    value={localSettings.primaryColor}
                    onChange={(e) => updateLocal("primaryColor", e.target.value)}
                    className="w-32 font-mono text-sm"
                    placeholder="#7c3aed"
                  />
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Secondary Accent Color" 
                description="Secondary color for accents and highlights"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white shadow-md cursor-pointer"
                    style={{ backgroundColor: localSettings.secondaryColor || "#64748b" }}
                    onClick={() => document.getElementById('secondary-color-picker')?.click()}
                  />
                  <Input
                    id="secondary-color-picker"
                    type="color"
                    value={localSettings.secondaryColor || "#64748b"}
                    onChange={(e) => updateLocal("secondaryColor", e.target.value)}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                  <Input
                    type="text"
                    value={localSettings.secondaryColor || "#64748b"}
                    onChange={(e) => updateLocal("secondaryColor", e.target.value)}
                    className="w-32 font-mono text-sm"
                    placeholder="#64748b"
                  />
                </div>
              </SettingsRow>

              {hasChanges && (
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </SettingsCard>
        </div>
      );
    }

    if (subsection === "branding-css") {
      return (
        <div className="space-y-6">
          <SettingsCard
            title="Custom CSS"
            description="Advanced styling customization"
            icon={Settings2}
            scope="global"
            helpText="Warning: Custom CSS can affect platform functionality"
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Custom CSS" 
                description="Add custom CSS rules (advanced users only)"
                vertical
              >
                <textarea
                  value={localSettings.customCss || ""}
                  onChange={(e) => updateLocal("customCss", e.target.value)}
                  placeholder="/* Add your custom CSS here */\n.custom-class {\n  color: #7c3aed;\n}"
                  className="w-full h-64 p-3 font-mono text-sm border rounded-md bg-muted/30"
                />
              </SettingsRow>

              {hasChanges && (
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </SettingsCard>
        </div>
      );
    }

    // Default branding view - show all
    return (
      <div className="space-y-6">
        <SettingsCard
          title="Company Branding"
          description="Customize your organization's visual identity"
          icon={Palette}
          scope="global"
          showResetButton={true}
          onReset={() => {
            console.log('Reset branding settings');
          }}
        >
          <div className="space-y-6">
            <SettingsRow 
              label="Company Logo" 
              description="Upload your company logo (light mode). Recommended size: 200x60px"
            >
              <div className="flex items-center gap-3">
                {localSettings.logoUrl && (
                  <img 
                    src={localSettings.logoUrl} 
                    alt="Company Logo" 
                    className="h-8 max-w-24 object-contain border rounded"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
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
              </div>
            </SettingsRow>

            <SettingsRow 
              label="Favicon" 
              description="Upload your site favicon. Recommended size: 32x32px"
            >
              <div className="flex items-center gap-3">
                {localSettings.faviconUrl && (
                  <img 
                    src={localSettings.faviconUrl} 
                    alt="Favicon" 
                    className="w-6 h-6 object-contain border rounded"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
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
              </div>
            </SettingsRow>

            <SettingsRow 
              label="Primary Color" 
              description="Primary brand color used throughout the application"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 border-white shadow-sm"
                  style={{ backgroundColor: localSettings.primaryColor }}
                />
                <Input
                  type="color"
                  value={localSettings.primaryColor}
                  onChange={(e) => updateLocal("primaryColor", e.target.value)}
                  className="w-20 h-8 p-1 border-0"
                />
                <Input
                  type="text"
                  value={localSettings.primaryColor}
                  onChange={(e) => updateLocal("primaryColor", e.target.value)}
                  className="w-20 font-mono text-sm"
                  placeholder="#7c3aed"
                />
              </div>
            </SettingsRow>

            {hasChanges && (
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </SettingsCard>
      </div>
    );
  }

  if (isNotifications) {
    // Render specific notification subsection
    if (subsection === "notifications-email") {
      return (
        <div className="space-y-6">
          <SettingsCard
            title="Email Notification Defaults"
            description="Configure default email notification settings for all users"
            icon={Mail}
            scope="global"
            helpText="Users can override these defaults in their personal settings"
          >
            <div className="space-y-4">
              <SettingsRow 
                label="New Ticket Assigned" 
                description="Send email when a ticket is assigned to a user"
              >
                <Switch
                  checked={localSettings.emailNewTicketAssigned === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("emailNewTicketAssigned", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow 
                label="Ticket Updated" 
                description="Send email when a ticket receives an update"
              >
                <Switch
                  checked={localSettings.emailTicketUpdated === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("emailTicketUpdated", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow 
                label="SLA Warning" 
                description="Alert when SLA threshold is breached"
              >
                <Switch
                  checked={localSettings.emailSLAWarning === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("emailSLAWarning", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow 
                label="Weekly Digest" 
                description="Send weekly summary email"
              >
                <Switch
                  checked={localSettings.emailWeeklyDigest === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("emailWeeklyDigest", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow 
                label="New Document Published" 
                description="Notify when new documentation is published"
              >
                <Switch
                  checked={localSettings.emailDocPublished === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("emailDocPublished", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow 
                label="@Mentions" 
                description="Email when mentioned in posts or comments"
              >
                <Switch
                  checked={localSettings.emailMentions === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("emailMentions", checked.toString())
                  }
                />
              </SettingsRow>
            </div>
          </SettingsCard>

          {hasChanges && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (subsection === "notifications-inapp") {
      return (
        <div className="space-y-6">
          <SettingsCard
            title="In-App Notification Defaults"
            description="Configure browser and in-app notification defaults"
            icon={Bell}
            scope="global"
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Desktop Notifications" 
                description="Show browser notifications for important events"
              >
                <Switch
                  checked={localSettings.inAppDesktopNotifications === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("inAppDesktopNotifications", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow 
                label="Sound Alerts" 
                description="Play sound for notifications"
              >
                <Switch
                  checked={localSettings.inAppSoundAlerts === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("inAppSoundAlerts", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow 
                label="Notification Badge" 
                description="Show notification count badge"
              >
                <Switch
                  checked={localSettings.inAppNotificationBadge === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("inAppNotificationBadge", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow 
                label="Real-time Updates" 
                description="Show notifications immediately vs batched"
              >
                <Switch
                  checked={localSettings.inAppRealtime === "true"}
                  onCheckedChange={(checked) => 
                    updateLocal("inAppRealtime", checked.toString())
                  }
                />
              </SettingsRow>
            </div>
          </SettingsCard>

          {hasChanges && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (subsection === "notifications-channels") {
      return (
        <div className="space-y-6">
          <SettingsCard
            title="Notification Channels"
            description="Configure third-party notification integrations"
            icon={Share2}
            scope="global"
            helpText="Coming soon: Slack, Teams, SMS integrations"
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Email" 
                description="Standard email notifications"
              >
                <Badge variant="default">Active</Badge>
              </SettingsRow>

              <SettingsRow 
                label="Slack Integration" 
                description="Send notifications to Slack channels"
              >
                <Badge variant="secondary">Coming Soon</Badge>
              </SettingsRow>

              <SettingsRow 
                label="Microsoft Teams" 
                description="Send notifications to Teams channels"
              >
                <Badge variant="secondary">Coming Soon</Badge>
              </SettingsRow>

              <SettingsRow 
                label="SMS Notifications" 
                description="Send urgent notifications via SMS"
              >
                <Badge variant="secondary">Coming Soon</Badge>
              </SettingsRow>
            </div>
          </SettingsCard>
        </div>
      );
    }

    // Default notifications view
    return (
      <div className="space-y-6">
        <SettingsCard
          title="Email Notifications"
          description="Configure default email notification settings for all users"
          icon={Bell}
          scope="global"
        >
          <div className="space-y-4">
            <SettingsRow 
              label="New Ticket Assigned" 
              description="Send email when a ticket is assigned to a user"
            >
              <Switch
                checked={localSettings.emailNewTicketAssigned === "true"}
                onCheckedChange={(checked) => 
                  updateLocal("emailNewTicketAssigned", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow 
              label="Ticket Updated" 
              description="Send email when a ticket is updated"
            >
              <Switch
                checked={localSettings.emailTicketUpdated === "true"}
                onCheckedChange={(checked) => 
                  updateLocal("emailTicketUpdated", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow 
              label="SLA Warning" 
              description="Send email when SLA threshold is breached"
            >
              <Switch
                checked={localSettings.emailSLAWarning === "true"}
                onCheckedChange={(checked) => 
                  updateLocal("emailSLAWarning", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow 
              label="Weekly Digest" 
              description="Send weekly summary email"
            >
              <Switch
                checked={localSettings.emailWeeklyDigest === "true"}
                onCheckedChange={(checked) => 
                  updateLocal("emailWeeklyDigest", checked.toString())
                }
              />
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="In-App Notifications"
          description="Configure browser and in-app notification defaults"
          icon={Bell}
          scope="global"
        >
          <div className="space-y-4">
            <SettingsRow 
              label="Desktop Notifications" 
              description="Show browser notifications for important events"
            >
              <Switch
                checked={localSettings.inAppDesktopNotifications === "true"}
                onCheckedChange={(checked) => 
                  updateLocal("inAppDesktopNotifications", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow 
              label="Sound Alerts" 
              description="Play sound for notifications"
            >
              <Switch
                checked={localSettings.inAppSoundAlerts === "true"}
                onCheckedChange={(checked) => 
                  updateLocal("inAppSoundAlerts", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow 
              label="Notification Badge" 
              description="Show notification count badge"
            >
              <Switch
                checked={localSettings.inAppNotificationBadge === "true"}
                onCheckedChange={(checked) => 
                  updateLocal("inAppNotificationBadge", checked.toString())
                }
              />
            </SettingsRow>
          </div>
        </SettingsCard>

        {hasChanges && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default General Settings
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Company Information"
        description="Basic information about your organization"
        icon={Building2}
        scope="global"
        helpText="This information will be displayed throughout the platform and in emails"
      >
        <div className="space-y-4">
          <SettingsRow 
            label="Company Name" 
            description="Displayed in header and emails"
          >
            <Input
              value={localSettings.companyName}
              onChange={(e) => updateLocal("companyName", e.target.value)}
              placeholder="Your Company Name"
              className="max-w-sm"
            />
          </SettingsRow>

          <SettingsRow 
            label="Platform Name" 
            description="The name of your platform instance"
          >
            <Input
              value={localSettings.platformName}
              onChange={(e) => updateLocal("platformName", e.target.value)}
              placeholder="Sakura Helpdesk"
              className="max-w-sm"
            />
          </SettingsRow>

          <SettingsRow 
            label="Support Email" 
            description="Users will contact this email for help"
          >
            <Input
              type="email"
              value={localSettings.supportEmail}
              onChange={(e) => updateLocal("supportEmail", e.target.value)}
              placeholder="support@yourcompany.com"
              className="max-w-sm"
            />
          </SettingsRow>

          <SettingsRow 
            label="Default Timezone" 
            description="Default timezone for new users"
          >
            <Select 
              value={localSettings.defaultTimezone} 
              onValueChange={(value) => updateLocal("defaultTimezone", value)}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pst">Pacific Standard Time</SelectItem>
                <SelectItem value="mst">Mountain Standard Time</SelectItem>
                <SelectItem value="cst">Central Standard Time</SelectItem>
                <SelectItem value="est">Eastern Standard Time</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Localization"
        description="Regional settings and formats"
        icon={Languages}
        scope="global"
      >
        <div className="space-y-4">
          <SettingsRow 
            label="Default Language" 
            description="Default language for the platform"
          >
            <Select 
              value={localSettings.defaultLanguage} 
              onValueChange={(value) => updateLocal("defaultLanguage", value)}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>

          <SettingsRow 
            label="Date Format" 
            description="How dates are displayed"
          >
            <Select 
              value={localSettings.dateFormat} 
              onValueChange={(value) => updateLocal("dateFormat", value)}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdy">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY (European)</SelectItem>
                <SelectItem value="ymd">YYYY-MM-DD (ISO)</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>

          <SettingsRow 
            label="Time Format" 
            description="12-hour or 24-hour time"
          >
            <Select 
              value={localSettings.timeFormat} 
              onValueChange={(value) => updateLocal("timeFormat", value)}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
        </div>
      </SettingsCard>

      <SettingsCard
        title="User Defaults"
        description="Default settings for new user accounts"
        icon={Settings2}
        scope="global"
      >
        <div className="space-y-4">
          <SettingsRow 
            label="Default Theme" 
            description="Default theme for new users"
          >
            <Select 
              value={localSettings.defaultTheme} 
              onValueChange={(value) => updateLocal("defaultTheme", value)}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>

          <SettingsRow 
            label="Allow Theme Override" 
            description="Allow users to change their theme preference"
          >
            <Switch
              checked={localSettings.allowUserThemeOverride === "true"}
              onCheckedChange={(checked) => 
                updateLocal("allowUserThemeOverride", checked.toString())
              }
            />
          </SettingsRow>
        </div>
      </SettingsCard>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}