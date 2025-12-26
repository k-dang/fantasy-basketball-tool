"use client";

import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoRosterAverages } from "@/components/demo/DemoRosterAverages";
import { DemoWeeklyStats } from "@/components/demo/DemoWeeklyStats";
import { DemoCategoryReportCard } from "@/components/demo/DemoCategoryReportCard";
import { DemoRoster } from "@/components/demo/DemoRoster";
import { DemoRosterPredictions } from "@/components/demo/DemoRosterPredictions";
import { DemoOpponentScoutTab } from "@/components/demo/DemoOpponentScoutTab";

export function DemoSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="demo"
      className="container mx-auto py-12 px-4 scroll-mt-8 relative z-10"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.60 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-3 tracking-tight">
          See It In Action
        </h2>
        <p className="text-lg text-muted-foreground">
          Explore the dashboard and discover powerful insights
        </p>
      </div>

      {/* Browser Window Container */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-card border-2 rounded-lg shadow-2xl overflow-hidden">
          {/* Browser Window Header */}
          <div className="bg-muted/50 border-b px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-background rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center">
                fantasy-basketball-tool.com/dashboard
              </div>
            </div>
          </div>

          {/* Browser Content */}
          <div className="p-6">
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
              <div className="lg:col-span-3 lg:min-h-[700px]">
                <Tabs defaultValue="weekly-stats">
                  <TabsList>
                    <TabsTrigger value="weekly-stats">
                      Weekly Stats
                    </TabsTrigger>
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
          </div>
        </div>
      </div>
    </motion.section>
  );
}
