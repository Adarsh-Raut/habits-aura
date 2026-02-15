export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1E2330] flex items-center justify-center">
      {children}
    </div>
  );
}
