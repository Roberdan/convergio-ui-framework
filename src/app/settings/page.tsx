"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactDensity, setCompactDensity] = useState(false);

  return (
    <div className="space-y-1">
      <div className="mb-6">
        <h1>Settings</h1>
        <p className="text-caption mt-1">Manage your account and application preferences.</p>
      </div>

      <section className="grid grid-cols-[220px_1fr] gap-8 border-b border-border py-6">
        <div>
          <h4>Profile</h4>
          <p className="text-micro mt-1">Your personal information.</p>
        </div>
        <div className="grid gap-4 max-w-lg">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Display Name</Label>
            <input
              id="name"
              defaultValue="Roberto D'Angelo"
              className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              defaultValue="roberto@convergio.dev"
              className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <Button size="sm">Save Changes</Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[220px_1fr] gap-8 border-b border-border py-6">
        <div>
          <h4>Notifications</h4>
          <p className="text-micro mt-1">Choose what alerts you receive.</p>
        </div>
        <div className="space-y-4 max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Desktop notifications</p>
              <p className="text-micro">Alerts for plan completions and failures.</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email digest</p>
              <p className="text-micro">Daily summary of agent activity.</p>
            </div>
            <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[220px_1fr] gap-8 border-b border-border py-6">
        <div>
          <h4>Appearance</h4>
          <p className="text-micro mt-1">Display and accessibility.</p>
        </div>
        <div className="space-y-4 max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reduced motion</p>
              <p className="text-micro">Minimize animations throughout the interface.</p>
            </div>
            <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Compact density</p>
              <p className="text-micro">Reduce spacing for more information on screen.</p>
            </div>
            <Switch checked={compactDensity} onCheckedChange={setCompactDensity} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[220px_1fr] gap-8 py-6">
        <div>
          <h4 className="text-destructive">Danger Zone</h4>
          <p className="text-micro mt-1">Irreversible actions.</p>
        </div>
        <div className="max-w-lg">
          <div className="flex items-center justify-between rounded-md border border-destructive/30 p-4">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-micro">Permanently remove your account and all data.</p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
