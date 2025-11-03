import { TableCell } from "@/components/ui/table";
import type { ParsedMatchup, StatContainer } from "@/types/yahoo";
import {
  getStatValue,
  formatPercentage,
  formatNumber,
  shouldSkipHighlight,
  isStatWonByTeam,
  hasValidComparison,
} from "@/lib/stat-utils";

interface StatCellProps {
  stat: StatContainer & { stat: { display_name: string } };
  matchup: ParsedMatchup;
}

export function StatCell({ stat, matchup }: StatCellProps) {
  const value = getStatValue(matchup.team_stats, stat.stat.stat_id);
  const displayName = stat.stat.display_name;

  const formattedValue = displayName.includes("%")
    ? formatPercentage(value)
    : formatNumber(value);

  const shouldSkip = shouldSkipHighlight(displayName);

  const teamStat = matchup.team_stats?.find(
    (s) => s.stat.stat_id === stat.stat.stat_id
  );
  const opponentStat = matchup.opponent_stats?.find(
    (s) => s.stat.stat_id === stat.stat.stat_id
  );
  const validComparison = hasValidComparison(teamStat, opponentStat, value);

  let className = "";
  if (!shouldSkip && validComparison) {
    const isWon = isStatWonByTeam(matchup, stat.stat.stat_id, displayName);
    className = isWon ? "bg-green-200" : "bg-red-100";
  }

  return <TableCell className={className}>{formattedValue}</TableCell>;
}
