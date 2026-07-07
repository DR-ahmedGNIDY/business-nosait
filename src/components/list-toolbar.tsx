"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Select } from "@/components/ui/input";

export function ListToolbar({
  placeholder = "Search…",
  filters = [],
}: {
  placeholder?: string;
  filters?: { name: string; options: { value: string; label: string }[]; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (q) sp.set("q", q);
      else sp.delete("q");
      sp.delete("page");
      router.replace(`${pathname}?${sp.toString()}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setFilter(name: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(name, value);
    else sp.delete(name);
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-input bg-card text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3"
        />
      </div>
      {filters.map((f) => (
        <Select key={f.name} defaultValue={params.get(f.name) || ""} onChange={(e) => setFilter(f.name, e.target.value)} className="sm:w-44">
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      ))}
    </div>
  );
}
