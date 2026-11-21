export default function AuthBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-ink-950">
      <div className="landing-grid absolute inset-0" aria-hidden="true" />
      <div className="landing-hero-glow absolute inset-x-0 top-0 h-[640px]" aria-hidden="true" />
      {children}
    </div>
  );
}
