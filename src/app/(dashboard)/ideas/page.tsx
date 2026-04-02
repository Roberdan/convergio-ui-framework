import { ideasApi } from "@/lib/api";
import { IdeasClient } from "./ideas-client";

export default async function IdeasPage() {
  let ideas = null;
  try {
    ideas = await ideasApi.listIdeas();
  } catch {
    // Daemon offline
  }
  return <IdeasClient initialIdeas={ideas} />;
}
