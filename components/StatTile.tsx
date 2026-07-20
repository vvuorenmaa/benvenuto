export function StatTile({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur p-4">
      <p className="text-3xl font-bold font-mono text-stone-900 dark:text-stone-100">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}
