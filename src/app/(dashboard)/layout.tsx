import { AppShell } from '@/components/shell/app-shell';
import { loadAppConfig, loadNavSections } from '@/lib/config-loader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const appConfig = loadAppConfig();
  const sections = loadNavSections();

  return (
    <AppShell sections={sections} brandName={appConfig.name} brandLogo={appConfig.logo}>
      {children}
    </AppShell>
  );
}
