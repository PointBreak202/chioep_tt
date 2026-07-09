import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg-base">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-10%] h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-40 blur-[100px]"
        style={{ background: "var(--accent)" }}
      />
      <div className="relative mx-auto min-h-screen w-full max-w-md pb-28">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
