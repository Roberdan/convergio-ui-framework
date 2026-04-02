import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { loadAppConfig, loadNavSections } from "@/lib/config-loader";
import { deleteSessionCookie } from "@/lib/session";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const appConfig = loadAppConfig();
  const sections = loadNavSections();

  async function handleLogout() {
    "use server";
    await deleteSessionCookie();
    redirect("/login");
  }

  return (
    <AppShell sections={sections} brandName={appConfig.name} brandLogo={appConfig.logo}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <form action={handleLogout}>
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
            >
              Sign out
            </button>
          </form>
        </div>
        {children}
      </div>
    </AppShell>
  );
}
