import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
  title?: string;
  description?: string;
  message?: string;
}

export function EmptyState({
  title,
  description,
  message,
}: EmptyStateProps) {
  if (!title) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {message && <p className="text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}

