export function StatTile({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3">
      <p className="text-xl font-semibold font-mono">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
