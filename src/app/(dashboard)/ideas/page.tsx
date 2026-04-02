import { ideasApi } from "@/lib/api";
import { IdeasClient } from "./ideas-client";

export const dynamic = 'force-dynamic';

export default async function IdeasPage() {
  let ideas = null;
  try {
    ideas = await ideasApi.listIdeas();
  } catch {
    // Daemon offline
  }
  return <IdeasClient initialIdeas={ideas} />;
}
