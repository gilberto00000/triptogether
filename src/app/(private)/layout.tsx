import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
