"use client";

import { ExternalLink } from "lucide-react";
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
import { useLeagues } from "@/lib/hooks";

interface LeagueSelectorProps {
  selectedLeague: League | null;
  onSelect: (league: League) => void;
}

export function LeagueSelector({
  selectedLeague,
  onSelect,
}: LeagueSelectorProps) {
  const { data: leaguesData, isLoading, error } = useLeagues();

  const leagues = leaguesData?.leagues || [];

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
        <div className="flex flex-col space-y-2">
          {leagues.map((league) => (
            <div key={league.league_key} className="flex gap-2">
              <Button
                variant={
                  selectedLeague?.league_key === league.league_key
                    ? "default"
                    : "outline"
                }
                onClick={() => onSelect(league)}
                className="justify-start flex-1"
              >
                <span className="truncate">
                  {league.name} ({league.season})
                </span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                title="Open in Yahoo"
              >
                <a
                  href={`https://basketball.fantasysports.yahoo.com/nba/${league.league_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
