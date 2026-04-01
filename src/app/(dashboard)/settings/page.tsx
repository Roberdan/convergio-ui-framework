"use client";

import { useActionState } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateProfile } from "@/lib/actions/profile";
import type { ActionResult } from "@/lib/actions/profile";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SettingsPage() {
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactDensity, setCompactDensity] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setClientError(null);
    const name = formData.get("name");
    const email = formData.get("email");
    if (!name || String(name).trim().length === 0) {
      setClientError("Name is required.");
      return;
    }
    if (!email || !validateEmail(String(email))) {
      setClientError("A valid email address is required.");
      return;
    }
    formAction(formData);
  }

  const errorMessage = clientError ?? (state && !state.success ? state.error : null);

  return (
    <div className="space-y-1">
      <div className="mb-6">
        <h1>Settings</h1>
        <p className="text-caption mt-1">Manage your account and application preferences.</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 border-b border-border py-6">
        <div>
          <h4>Profile</h4>
          <p className="text-micro mt-1">Your personal information.</p>
        </div>
        <div className="grid gap-4 max-w-lg">
          <form ref={formRef} action={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Display Name</Label>
            <input
              id="name"
              name="name"
              required
              minLength={1}
              defaultValue="Roberto D'Angelo"
              className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="roberto@convergio.dev"
              className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">{errorMessage}</p>
          )}
          {state?.success && !clientError && (
            <p role="status" className="text-sm text-green-600">Profile saved.</p>
          )}
          <div>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          </form>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 border-b border-border py-6">
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

      <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 border-b border-border py-6">
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

      <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 py-6">
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
