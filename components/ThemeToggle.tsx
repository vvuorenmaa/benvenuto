"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const OPTIONS = [
  { value: "light", label: "Vaalea teema", icon: Sun },
  { value: "dark", label: "Tumma teema", icon: Moon },
  { value: "system", label: "Järjestelmän mukaan", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes:n dokumentoitu hydraatiovarmistuskaava: `theme` on aina
    // `undefined` palvelimella eikä ole tiedossa ennen ensimmäistä client-
    // renderöintiä, joten napin aktiivitila renderöitäisiin hetkeksi väärin
    // (tai vilkkuisi) ilman tätä. `suppressHydrationWarning` estäisi vain
    // varoituksen, ei itse visuaalista väläystä, joten mounted-tarkistus on
    // tässä tarkoituksellinen poikkeus yleisohjeeseen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-full" aria-hidden="true" />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Teeman valinta"
      className="inline-flex w-full rounded-lg bg-stone-100 dark:bg-stone-800 p-1"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(option.value)}
            aria-label={option.label}
            className={`flex flex-1 items-center justify-center rounded-md py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 ${
              active
                ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-50 shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
