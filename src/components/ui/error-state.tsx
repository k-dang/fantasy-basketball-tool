import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  error: Error | unknown;
  fullScreen?: boolean;
}

export function ErrorState({
  title = "Error",
  error,
  fullScreen = false,
}: ErrorStateProps) {
  const errorMessage =
    error instanceof Error ? error.message : "An error occurred";

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{errorMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-destructive">{errorMessage}</p>
      </CardContent>
    </Card>
  );
}
