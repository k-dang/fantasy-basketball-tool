import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  error: Error | unknown;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
}

export function ErrorState({
  title = "Error",
  error,
  onRetry,
  retryLabel = "Try Again",
  fullScreen = false,
}: ErrorStateProps) {
  const errorMessage =
    error instanceof Error ? error.message : "An error occurred";

  const content = (
    <>
      <p className="text-destructive">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-4">
          {retryLabel}
        </Button>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

