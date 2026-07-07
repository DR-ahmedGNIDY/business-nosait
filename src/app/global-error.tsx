"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>{error.message || "An unexpected error occurred."}</p>
        <button onClick={reset} style={{ background: "#1877F2", color: "#fff", padding: "8px 16px", borderRadius: 8, border: 0 }}>Try again</button>
      </body>
    </html>
  );
}
