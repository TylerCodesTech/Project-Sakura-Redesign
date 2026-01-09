import { Palette, Bell, Settings2, Globe, Moon, Sun, Upload } from "lucide-react";
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
import { SettingsHeader, SettingsCard, SettingsSection, SettingsRow } from "../components";

interface GeneralSettingsProps {
  subsection?: string;
}

export function GeneralSettings({ subsection }: GeneralSettingsProps) {
  const isBranding = subsection === "branding";
  const isNotifications = subsection === "notifications";

  if (isBranding) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          sectionId="branding"
          title="Branding"
          description="Customize the look and feel of your platform."
        />

        <SettingsCard
          title="Logo & Identity"
          description="Upload your organization's branding assets."
          icon={Palette}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SettingsRow label="Company Name" vertical>
                <Input placeholder="Acme Inc." defaultValue="Sakura" />
              </SettingsRow>
              <SettingsRow label="Logo" vertical>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    S
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" /> Upload
                  </Button>
                </div>
              </SettingsRow>
            </div>
            <div className="space-y-4">
              <SettingsRow label="Favicon" vertical>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    S
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" /> Upload
                  </Button>
                </div>
              </SettingsRow>
              <SettingsRow label="Primary Color" vertical>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1 cursor-pointer" defaultValue="#7c3aed" />
                  <Input defaultValue="#7c3aed" placeholder="#7c3aed" />
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
              <Select defaultValue="system">
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
              <Switch defaultChecked />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    );
  }

  if (isNotifications) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          sectionId="notifications"
          title="Notifications"
          description="Configure platform-wide notification settings."
        />

        <SettingsCard
          title="Email Notifications"
          description="Configure when emails are sent to users."
          icon={Bell}
        >
          <div className="space-y-4">
            <SettingsRow label="New Ticket Assigned" description="Notify agents when assigned a ticket.">
              <Switch defaultChecked />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Ticket Updated" description="Notify when ticket status changes.">
              <Switch defaultChecked />
            </SettingsRow>
            <Separator />
            <SettingsRow label="SLA Warning" description="Alert before SLA breach.">
              <Switch defaultChecked />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Weekly Digest" description="Send weekly summary to admins.">
              <Switch />
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
              <Switch defaultChecked />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Sound Alerts" description="Play sound for new notifications.">
              <Switch />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Notification Badge" description="Show unread count in tab title.">
              <Switch defaultChecked />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId="general"
        title="General Settings"
        description="Platform-wide settings and preferences."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsCard
          title="Platform"
          description="Basic platform configuration."
          icon={Globe}
        >
          <div className="space-y-4">
            <SettingsRow label="Platform Name" vertical>
              <Input placeholder="My Helpdesk" defaultValue="Sakura Helpdesk" />
            </SettingsRow>
            <SettingsRow label="Support Email" vertical>
              <Input placeholder="support@company.com" />
            </SettingsRow>
            <SettingsRow label="Default Timezone" vertical>
              <Select defaultValue="pst">
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
              <Select defaultValue="en">
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
              <Select defaultValue="mdy">
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
              <Select defaultValue="12">
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
