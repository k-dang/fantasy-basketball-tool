import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthButton } from "@/components/AuthButton";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Fantasy Basketball Tool</CardTitle>
            <CardDescription>
              Sign in with Yahoo to view your fantasy basketball league
              statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <AuthButton />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Connect your Yahoo Fantasy Basketball account to get started
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
