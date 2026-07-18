"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Keskustelu", icon: "💬" },
  { href: "/sanasto", label: "Sanasto", icon: "📚" },
  { href: "/kertaus", label: "Kertaus", icon: "🔄" },
  { href: "/kielioppi", label: "Kielioppi", icon: "📖" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDueCount() {
      try {
        const res = await fetch("/api/vocab?due=true");
        if (!res.ok) return;
        const data: unknown[] = await res.json();
        if (!cancelled) setDueCount(data.length);
      } catch {
        // hiljainen epäonnistuminen — badge jää vain näyttämättä
      }
    }

    loadDueCount();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <>
      {/* Desktop-sivupalkki */}
      <nav
        aria-label="Päänavigaatio"
        className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-neutral-200 dark:md:border-neutral-800 md:p-4 md:space-y-1"
      >
        <p className="font-semibold mb-3 px-2">Benvenuto</p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const showBadge = item.href === "/kertaus" && dueCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={
                showBadge ? `${item.label}, ${dueCount} sanaa odottaa kertausta` : undefined
              }
              className={`flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </span>
              {showBadge && (
                <span className="rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs px-1.5 py-0.5">
                  {dueCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobiili-alapalkki */}
      <nav
        aria-label="Päänavigaatio"
        className="fixed bottom-0 inset-x-0 z-30 flex md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const showBadge = item.href === "/kertaus" && dueCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={
                showBadge ? `${item.label}, ${dueCount} sanaa odottaa kertausta` : item.label
              }
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              <span className="relative text-lg" aria-hidden="true">
                {item.icon}
                {showBadge && (
                  <span className="absolute -top-1 -right-2 rounded-full bg-blue-600 text-white text-[10px] leading-none px-1 py-0.5">
                    {dueCount}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
