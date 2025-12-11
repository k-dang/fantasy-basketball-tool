"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockMatchups } from "@/lib/mock-data";
import {
  buildCategorySummaries,
  formatMargin,
  getGrade,
} from "@/components/CategoryReportCard";

export function DemoCategoryReportCard() {
  const summaries = buildCategorySummaries(mockMatchups.matchups);

  if (summaries.length === 0) {
    return null;
  }

  const strongestCategory = summaries[0];
  const weakestCategory = summaries[summaries.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Report Card</CardTitle>
        <CardDescription>
          Wins, losses, and average margins for each scoring category across
          completed matchups.
        </CardDescription>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-foreground">Biggest Strength</p>
            <p className="text-muted-foreground">
              {strongestCategory.displayName} ({strongestCategory.wins}-
              {strongestCategory.losses}-{strongestCategory.ties})
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Biggest Opportunity</p>
            <p className="text-muted-foreground">
              {weakestCategory.displayName} ({weakestCategory.wins}-
              {weakestCategory.losses}-{weakestCategory.ties})
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Avg Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => {
                const winRate = summary.winPoints / summary.games;
                const { grade, variant } = getGrade(winRate);
                return (
                  <TableRow key={summary.statId}>
                    <TableCell className="font-medium">
                      {summary.displayName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant}>{grade}</Badge>
                    </TableCell>
                    <TableCell>
                      {summary.wins}-{summary.losses}-{summary.ties}
                    </TableCell>
                    <TableCell>{(winRate * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      {formatMargin(summary.displayName, summary.averageMargin)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
