import Link from "next/link";
import { Skeleton } from "./skeleton";

interface HeaderProps {
  title?: string;
  slug?: string;
  endpoint?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Header({
  title,
  slug,
  endpoint,
  loading = false,
  children,
}: HeaderProps) {
  return (
    <header className="mb-8 flex w-full items-center justify-between">
      <div className="space-y-2">
        {!loading ? (
          <p className="text-sm text-muted-foreground">{slug}</p>
        ) : (
          <Skeleton className="h-6 w-20" />
        )}
        {!loading ? (
          <h1 className="text-3xl font-bold">{title}</h1>
        ) : (
          <Skeleton className="h-8 w-36 max-w-full" />
        )}
        {!loading && endpoint ? (
          <p className="text-sm">
            Endpoint:&nbsp;
            <Link href={endpoint} target="_blank">
              {endpoint}
            </Link>
          </p>
        ) : (
          <Skeleton className="h-6 w-96 max-w-full" />
        )}
      </div>
      <div>{children}</div>
    </header>
  );
}