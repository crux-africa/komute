import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardShell from "@/components/layout/dashboard-shell";
import Script from "next/script";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isOnboarded) redirect("/onboarding");

  return (
    <>
      <Script src="https://newwebpay.qa.interswitchng.com/inline-checkout.js" strategy="afterInteractive" />
      <DashboardShell user={{ name: user.name, roles: user.roles, phone: user.phone }}>
        {children}
      </DashboardShell>
    </>
  );
}