import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // TODO: replace with real auth — demo credentials only (admin / admin)
    if (username === "admin" && password === "admin") {
      const cookieStore = await cookies();
      cookieStore.set("session", "authenticated", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      redirect("/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl">Sign in</h1>
          <p className="text-caption mt-1">Enter your credentials to continue.</p>
        </div>
        <form action={handleLogin} className="grid gap-4 rounded-lg border bg-card p-6 text-card-foreground">
          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="admin"
              autoComplete="username"
              className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <p className="text-center text-micro">
          No account yet? Contact your administrator.
        </p>
      </div>
    </div>
  );
}
