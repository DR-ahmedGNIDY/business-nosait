"use client";

import { Printer, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportExport() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> PDF</Button>
      <a href="/api/reports/export?type=top-clients"><Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4" /> Clients CSV</Button></a>
      <a href="/api/reports/export?type=outstanding"><Button variant="outline" size="sm"><FileText className="h-4 w-4" /> Outstanding CSV</Button></a>
    </div>
  );
}
