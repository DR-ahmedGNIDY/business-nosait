"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface Result {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border px-4">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Search className="h-4 w-4 text-muted-foreground" />}
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients, projects, contracts…"
            className="h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="scrollbar-thin max-h-80 overflow-y-auto p-2">
          {q.length >= 2 && results.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-muted-foreground">No results for “{q}”</p>
          )}
          {results.map((r) => (
            <button
              key={r.type + r.id}
              onClick={() => {
                router.push(r.href);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-start hover:bg-muted"
            >
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                {r.subtitle && <p className="text-xs text-muted-foreground">{r.subtitle}</p>}
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize text-muted-foreground">{r.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
