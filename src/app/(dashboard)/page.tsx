import Link from "next/link";
import { Palette, Layers, Eye } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Maranello Design System</h1>
      <p className="text-muted-foreground text-center max-w-lg">
        100 React components, 4 themes, config-driven architecture.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/showcase" className="flex flex-col items-center gap-2 rounded-lg border p-6 hover:bg-accent/50 transition-colors">
          <Palette className="h-8 w-8 text-primary" />
          <span className="font-medium">Showcase</span>
        </Link>
        <Link href="/showcase/themes" className="flex flex-col items-center gap-2 rounded-lg border p-6 hover:bg-accent/50 transition-colors">
          <Layers className="h-8 w-8 text-primary" />
          <span className="font-medium">Themes</span>
        </Link>
        <Link href="/preview" className="flex flex-col items-center gap-2 rounded-lg border p-6 hover:bg-accent/50 transition-colors">
          <Eye className="h-8 w-8 text-primary" />
          <span className="font-medium">Preview</span>
        </Link>
      </div>
    </div>
  );
}
