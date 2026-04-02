"use client";

import { MnTabs, MnTabList, MnTab, MnTabPanel } from "@/components/maranello";
import { SettingsProfile } from "./settings-profile";
import { SettingsSystem } from "./settings-system";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-caption mt-1">
          Manage your account, preferences, and system configuration.
        </p>
      </div>

      <MnTabs defaultValue="profile">
        <MnTabList>
          <MnTab value="profile">Profile</MnTab>
          <MnTab value="system">System Health</MnTab>
          <MnTab value="channels">Channels</MnTab>
        </MnTabList>

        <MnTabPanel value="profile">
          <SettingsProfile />
        </MnTabPanel>

        <MnTabPanel value="system">
          <SettingsSystem />
        </MnTabPanel>

        <MnTabPanel value="channels">
          <SettingsChannels />
        </MnTabPanel>
      </MnTabs>
    </div>
  );
}

function SettingsChannels() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <p className="text-sm text-muted-foreground">
        Notification channels will be loaded from the daemon.
      </p>
    </div>
  );
}
