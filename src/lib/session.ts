import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/** Returns the authenticated session or throws — use at the top of server actions. */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

/** Display name of the current user, for createdBy / audit fields. */
export async function currentUserLabel(): Promise<string> {
  const session = await getServerSession(authOptions);
  return session?.user?.name || session?.user?.email || "system";
}
