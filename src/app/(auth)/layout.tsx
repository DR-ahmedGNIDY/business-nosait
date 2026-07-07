export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0F172A] p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold">N</div>
          <div>
            <p className="text-lg font-bold">Nosait Business</p>
            <p className="text-xs text-white/60">Manage Clients • Projects • Contracts</p>
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            The operating system for your agency.
          </h2>
          <p className="max-w-md text-white/70">
            Clients, projects, subscriptions, electronic contracts, expenses and reports — all in one premium workspace.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} Nosait Business</p>
      </div>
      <div className="flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
