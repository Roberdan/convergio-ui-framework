import { orgsApi } from "@/lib/api";
import { OrgsListClient } from "./orgs-list-client";

export const dynamic = 'force-dynamic';

export default async function OrgsPage() {
  let orgs = null;
  try {
    orgs = await orgsApi.listOrgs();
  } catch {
    // Daemon offline
  }
  return <OrgsListClient initialOrgs={orgs} />;
}
