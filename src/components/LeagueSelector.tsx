"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { League } from "@/types/yahoo";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: League | null;
  onSelect: (league: League) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function LeagueSelector({
  leagues,
  selectedLeague,
  onSelect,
  isLoading = false,
  error = null,
}: LeagueSelectorProps) {
  if (isLoading) {
    return <LoadingState title="Select League" message="Loading leagues..." />;
  }

  if (error) {
    return <ErrorState title="Select League" error={error} />;
  }

  if (leagues.length === 0) {
    return (
      <EmptyState message="No basketball leagues found. Make sure you're part of a Yahoo Fantasy Basketball league." />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select League</CardTitle>
        <CardDescription>
          Choose a league to view team statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {leagues.map((league) => (
            <Button
              key={league.league_key}
              variant={
                selectedLeague?.league_key === league.league_key
                  ? "default"
                  : "outline"
              }
              onClick={() => onSelect(league)}
              className="justify-start"
            >
              {league.name} ({league.season})
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
