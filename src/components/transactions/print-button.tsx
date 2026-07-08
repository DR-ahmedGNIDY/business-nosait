"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ auto = false }: { auto?: boolean }) {
  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [auto]);
  return (
    <Button size="sm" onClick={() => window.print()} className="print:hidden">
      <Printer className="h-4 w-4" /> Print / Save as PDF
    </Button>
  );
}
