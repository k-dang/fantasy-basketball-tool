import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthButton } from "@/components/AuthButton";
import { DemoScrollButton } from "@/components/DemoScrollButton";
import { DemoSection } from "@/components/home/DemoSection";
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
      <DemoSection />

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
