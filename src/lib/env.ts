/**
 * Central place to read required environment variables. Throws a clear,
 * descriptive error (logged server-side) instead of letting downstream code
 * fail with a confusing error (e.g. mongoose trying to connect to
 * 127.0.0.1 on a serverless host because MONGODB_URI was never set).
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    const message = `Missing required environment variable "${name}". Set it in the Vercel project settings (Project → Settings → Environment Variables) — .env.local is not deployed.`;
    console.error(`[env] ${message}`);
    throw new Error(message);
  }
  return value;
}

export function getMongoUri(): string {
  return required("MONGODB_URI");
}

/** Warns (without throwing at import time) so a missing secret doesn't crash every page load. */
export function warnIfMissingNextAuthSecret(): void {
  if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_SECRET.trim()) {
    console.error(
      '[env] Missing "NEXTAUTH_SECRET". Sessions will fail to encode/decode in production. Set it in the Vercel project settings.'
    );
  }
}
