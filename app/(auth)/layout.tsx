import AuthBackground from "@/app/components/AuthBackground";
import { getAppSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();

  if (session?.user?.id) {
    redirect("/");
  }

  return (
    <AuthBackground>{children}</AuthBackground>
  );
}
