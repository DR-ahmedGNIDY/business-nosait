"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Export the current (filtered) list to CSV / Excel-compatible CSV, or print to PDF. */
export function ExportMenu({ entity, params = {} }: { entity: string; params?: Record<string, string> }) {
  function href(format: string) {
    const sp = new URLSearchParams(params as Record<string, string>);
    sp.set("format", format);
    return `/api/export/${entity}?${sp.toString()}`;
  }
  return (
    <div className="flex items-center gap-2">
      <a href={href("csv")} download>
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> CSV</Button>
      </a>
      <a href={href("excel")} download>
        <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
      </a>
      <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> PDF</Button>
    </div>
  );
}
