import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthButton } from "@/components/AuthButton";
import { DemoScrollButton } from "@/components/DemoScrollButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoRosterAverages } from "@/components/demo/DemoRosterAverages";
import { DemoWeeklyStats } from "@/components/demo/DemoWeeklyStats";
import { DemoCategoryReportCard } from "@/components/demo/DemoCategoryReportCard";
import { DemoRoster } from "@/components/demo/DemoRoster";
import { DemoRosterPredictions } from "@/components/demo/DemoRosterPredictions";
import { DemoOpponentScoutTab } from "@/components/demo/DemoOpponentScoutTab";
import { Badge } from "@/components/ui/badge";
import { BarChart2, TrendingUp, Swords, Shield } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen font-sans flex flex-col relative">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-100 z-0" />
      {/* Hero Section */}
      <section className="relative overflow-hidden z-10">
        <div className="container mx-auto py-16 md:py-24 px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Column - Content */}
            <div className="text-center md:text-left">
              {/* Badge */}
              <div className="flex justify-center md:justify-start mb-6">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Shield className="size-3" />
                  Secure Yahoo OAuth
                </Badge>
              </div>

              {/* Headline with gradient */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Fantasy Basketball
                </span>
                <br />
                <span className="text-foreground">Tool</span>
              </h1>

              {/* Subcopy */}
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto md:mx-0">
                Your fantasy stats, analyzed. Get deeper insights into your
                team&apos;s performance with weekly stats, roster averages, and
                category analysis.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                <Badge variant="outline" className="text-xs">
                  Weekly Stats
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Roster Averages
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Opponent Scout
                </Badge>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-4">
                <AuthButton />
                <DemoScrollButton />
              </div>

              {/* Microcopy */}
              <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1.5">
                <Shield className="size-3.5" />
                Secure Yahoo OAuth. No passwords stored.
              </p>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden shadow-2xl border-2 border-border">
                <Image
                  src="/images/hero.webp"
                  alt="Fantasy Basketball Tool Dashboard Preview"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="container mx-auto py-16 px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-2">Deep Analytics</CardTitle>
              <CardDescription>
                Weekly stats and category breakdowns to understand your
                team&apos;s strengths and weaknesses.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-2">Smart Predictions</CardTitle>
              <CardDescription>
                Projections based on roster trends and historical performance to
                help you make informed decisions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Swords className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-2">Opponent Scouting</CardTitle>
              <CardDescription>
                Analyze matchups to gain an edge and optimize your lineup for
                each week.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Demo Section */}
      <section
        id="demo"
        className="container mx-auto py-12 px-4 scroll-mt-8 relative z-10"
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
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/30 py-8 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fantasy Basketball Tool. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
