/**
 * Runtime environment-variable helpers for CLI scripts.
 *
 * `requireEnv` throws when a variable is missing and RETURNS a `string`, so the
 * TypeScript compiler treats the result as a guaranteed string at the call site
 * — no non-null assertions, `as string` casts, `any`, or ts-ignore needed.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Environment variable "${name}" is required but was not set.`);
  }
  return value;
}

/** Optional variable with a typed default; always returns a `string`. */
export function envOr(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? fallback : value;
}
