import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant } from "@/lib/stat-utils";
import Image from "next/image";

interface PlayerCellProps {
  name: string | undefined;
  image_url: string | undefined;
  status: string | undefined;
  status_full: string | undefined;
}

export function PlayerCell({
  name,
  image_url,
  status,
  status_full,
}: PlayerCellProps) {
  return (
    <TableCell className="sticky left-0 bg-background z-10 font-medium">
      <div className="flex items-center gap-2">
        <div className="relative size-10 shrink-0">
          <Image
            src={image_url || ""}
            alt={name || "Player"}
            fill
            sizes="48px"
            className="rounded-full object-cover object-top"
            unoptimized
          />
        </div>
        <span>{name || "Unknown Player"}</span>
        {status && (
          <Badge
            variant={getStatusBadgeVariant(status)}
            title={status_full || status}
          >
            {status}
          </Badge>
        )}
      </div>
    </TableCell>
  );
}

