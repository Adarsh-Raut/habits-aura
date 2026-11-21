export default function AuthBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-paper">
      {children}
    </div>
  );
}
