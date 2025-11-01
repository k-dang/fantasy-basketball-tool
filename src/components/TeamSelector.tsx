"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface Team {
  team_key: string;
  name: string;
}

interface TeamSelectorProps {
  teams: Team[];
  selectedTeam: string | null;
  onSelect: (teamKey: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function TeamSelector({
  teams,
  selectedTeam,
  onSelect,
  isLoading = false,
  error = null,
}: TeamSelectorProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Select Team"
        message="Loading teams..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Select Team"
        error={error}
      />
    );
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        title="Select Team"
        description="Choose a team to view statistics"
        message="Team selection coming soon. For now, you can view stats by team key."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Team</CardTitle>
        <CardDescription>Choose a team to view statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {teams.map((team) => (
            <Button
              key={team.team_key}
              variant={selectedTeam === team.team_key ? "default" : "outline"}
              onClick={() => onSelect(team.team_key)}
              className="justify-start"
            >
              {team.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

