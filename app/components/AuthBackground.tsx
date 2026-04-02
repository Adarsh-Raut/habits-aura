export default function AuthBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#1E2330]">
      <div className="auth-background-glow absolute inset-0" aria-hidden="true" />
      {children}
    </div>
  );
}
