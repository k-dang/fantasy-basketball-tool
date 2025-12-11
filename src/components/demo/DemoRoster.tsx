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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateStatRanges } from "@/lib/stat-utils";
import { PlayerCell } from "@/components/PlayerCell";
import { ColoredStatCell } from "@/components/ColoredStatCell";
import { mockRoster } from "@/lib/mock-data";

export function DemoRoster() {
  const roster = mockRoster.roster;

  // Use the order from the first player's stats
  const stats =
    roster[0]?.stats?.map((stat) => ({
      stat_id: stat.stat_id,
      display_name: stat.display_name,
    })) || [];

  // Calculate min/max ranges for each stat (excluding null values)
  const statRanges = calculateStatRanges(roster, (player) =>
    player.stats?.map((stat) => ({
      stat_id: stat.stat_id,
      value: stat.value,
    }))
  );

  if (!roster || roster.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roster</CardTitle>
        <CardDescription>
          Current team roster with player statistics for week 3
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">
                  Player
                </TableHead>
                {stats.map((stat) => (
                  <TableHead key={stat.stat_id}>{stat.display_name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((player, index) => (
                <TableRow key={`player-${index}-${player.name}`}>
                  <PlayerCell
                    name={player.name}
                    image_url={player.image_url}
                    status={player.status}
                    status_full={player.status_full}
                  />
                  {stats.map((stat) => {
                    const playerStat = player.stats?.find(
                      (s) => s.stat_id === stat.stat_id
                    );
                    const value = playerStat?.value || "-";

                    return (
                      <ColoredStatCell
                        key={stat.stat_id}
                        value={value}
                        statId={stat.stat_id}
                        statRanges={statRanges}
                      />
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
