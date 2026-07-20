"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Keskustelu", icon: "/icons/chat.svg" },
  { href: "/sanasto", label: "Sanasto", icon: "/icons/vocab.svg" },
  { href: "/kertaus", label: "Kertaus", icon: "/icons/review.svg" },
  { href: "/kielioppi", label: "Kielioppi", icon: "/icons/grammar.svg" },
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
        className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-stone-200 dark:md:border-stone-800 md:p-4 md:space-y-2"
      >
        <p className="flex items-center gap-2 font-semibold mb-4 px-2">
          Benvenuto
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
        </p>
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
              className={`group relative flex items-center justify-between gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 ${
                active
                  ? "bg-stone-100 dark:bg-stone-800/60 text-stone-900 dark:text-white"
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              {active && (
                <span
                  className="absolute left-0 inset-y-1.5 w-0.5 rounded-r-full bg-green-600"
                  aria-hidden="true"
                />
              )}
              <span className="flex items-center gap-3">
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className={`h-8 w-8 shrink-0 transition-opacity ${
                    active ? "opacity-100" : "opacity-50 group-hover:opacity-75"
                  }`}
                />
                {item.label}
              </span>
              {showBadge && (
                <span className="rounded-full bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 text-xs px-1.5 py-0.5">
                  {dueCount}
                </span>
              )}
            </Link>
          );
        })}

        <div className="mt-auto pt-4 border-t border-stone-200 dark:border-stone-800">
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobiili-alapalkki */}
      <nav
        aria-label="Päänavigaatio"
        className="fixed bottom-0 inset-x-0 z-30 flex md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950"
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
              className={`group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 ${
                active
                  ? "text-green-700 dark:text-green-400"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              <span className="relative" aria-hidden="true">
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className={`h-7 w-7 transition-opacity ${
                    active ? "opacity-100" : "opacity-50 group-hover:opacity-75"
                  }`}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 rounded-full bg-green-700 text-white text-[10px] leading-none px-1 py-0.5">
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
