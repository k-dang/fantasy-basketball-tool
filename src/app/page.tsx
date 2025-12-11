"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthButton } from "@/components/AuthButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoRosterAverages } from "@/components/demo/DemoRosterAverages";
import { DemoWeeklyStats } from "@/components/demo/DemoWeeklyStats";
import { DemoCategoryReportCard } from "@/components/demo/DemoCategoryReportCard";
import { DemoRoster } from "@/components/demo/DemoRoster";
import { DemoRosterPredictions } from "@/components/demo/DemoRosterPredictions";
import { DemoOpponentScoutTab } from "@/components/demo/DemoOpponentScoutTab";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Fantasy Basketball Tool</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your fantasy stats, analyzed. Get deeper insights into your team&apos;s
          performance with weekly stats, roster averages, and category analysis.
        </p>
        <div className="flex justify-center">
          <AuthButton />
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto py-8 px-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">See It In Action</h2>
          <p className="text-muted-foreground">
            Explore the dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Demo Selectors */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select League</CardTitle>
                <CardDescription className="text-sm">
                  Choose a league to view team statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-10 bg-muted rounded-md flex items-center px-3 text-sm text-muted-foreground">
                    Demo League
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Team</CardTitle>
                <CardDescription className="text-sm">
                  Choose a team to view statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-10 bg-primary text-primary-foreground rounded-md flex items-center px-3 text-sm font-medium">
                    Demo Team
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Dashboard */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="weekly-stats">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="weekly-stats">Weekly Stats</TabsTrigger>
                <TabsTrigger value="roster">Roster</TabsTrigger>
                <TabsTrigger value="roster-averages">
                  Roster Averages
                </TabsTrigger>
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
                <TabsTrigger value="category-report">
                  Season Report Card
                </TabsTrigger>
                <TabsTrigger value="opponent-scout">
                  Opponent Scout
                </TabsTrigger>
              </TabsList>
              <TabsContent value="weekly-stats" className="mt-6">
                <DemoWeeklyStats />
              </TabsContent>
              <TabsContent value="roster" className="mt-6">
                <DemoRoster />
              </TabsContent>
              <TabsContent value="roster-averages" className="mt-6">
                <DemoRosterAverages />
              </TabsContent>
              <TabsContent value="predictions" className="mt-6">
                <DemoRosterPredictions />
              </TabsContent>
              <TabsContent value="category-report" className="mt-6">
                <DemoCategoryReportCard />
              </TabsContent>
              <TabsContent value="opponent-scout" className="mt-6">
                <DemoOpponentScoutTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}
