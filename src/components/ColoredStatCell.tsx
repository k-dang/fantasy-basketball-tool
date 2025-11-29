import { TableCell } from "@/components/ui/table";
import { getStatBackgroundColor } from "@/lib/stat-utils";

interface ColoredStatCellProps {
  value: number | string | null | undefined;
  statId: string;
  statRanges: Record<string, { min: number; max: number }>;
}

export function ColoredStatCell({
  value,
  statId,
  statRanges,
}: ColoredStatCellProps) {
  // Convert value to number if it's a string
  const numericValue =
    value === null || value === undefined
      ? null
      : typeof value === "string"
      ? value === "-"
        ? null
        : parseFloat(value)
      : value;

  // Format the display value
  const formattedValue =
    numericValue === null || isNaN(numericValue)
      ? "-"
      : numericValue.toFixed(1);

  // Get background color based on value's position in range
  const backgroundColor = getStatBackgroundColor(
    statId,
    numericValue ?? null,
    statRanges
  );

  return (
    <TableCell
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {formattedValue}
    </TableCell>
  );
}

