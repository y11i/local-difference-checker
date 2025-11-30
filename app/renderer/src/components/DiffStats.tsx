import { DiffStats } from '@/types/diff';

type DiffStatsProps = {
  stats: DiffStats | null;
};

export function DiffStatsSummary({ stats }: DiffStatsProps) {
  if (!stats) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-xs font-semibold">
      <span className="text-emerald-500">+{stats.additions}</span>
      <span className="text-red-500">-{stats.deletions}</span>
      <span className="text-amber-500">±{stats.changes}</span>
    </div>
  );
}
