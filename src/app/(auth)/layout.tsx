import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandPanel } from "@/components/auth/brand-panel";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/propostas");
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <BrandPanel />
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <Image
          src="/vizu-logo-dark.svg"
          alt="Vizu"
          width={110}
          height={32}
          priority
          className="mb-10 h-8 w-auto lg:hidden"
        />
        {children}
      </div>
    </div>
  );
}
