import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">{children}</thead>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-border last:border-0 hover:bg-muted/50", className)}>{children}</tr>;
}

export function TH({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-start font-semibold", className)}>{children}</th>;
}

export function TD({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
