"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/format";

const NAV_ITEMS = [
  { href: "/propostas", label: "Propostas" },
  { href: "/clientes", label: "Clientes" },
  { href: "/configuracoes", label: "Configurações" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between gap-8 overflow-y-auto border-r border-border bg-background p-6">
      <div>
        <Image
          src="/vizu-logo-dark.svg"
          alt="Vizu"
          width={100}
          height={29}
          priority
          className="h-7 w-auto"
        />

        <nav className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-accent" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {getInitials(userName)}
        </span>
        <span className="truncate text-sm font-medium text-foreground">
          {userName}
        </span>
      </div>
    </aside>
  );
}
