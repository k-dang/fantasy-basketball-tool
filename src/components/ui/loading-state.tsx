import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoadingStateProps {
  title?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  title = "Loading",
  message,
  fullScreen = false,
}: LoadingStateProps) {
  const content = (
    <div className="text-center">
      <p className="text-muted-foreground">{message || "Loading..."}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {content}
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

