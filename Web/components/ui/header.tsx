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
  loading = false,
  children,
}: HeaderProps) {
  return (
    <header className="mb-4 flex w-full items-start justify-between gap-4">
      <div className="w-full space-y-2">
        {!loading ? (
          <p className="text-muted-foreground truncate text-sm">{slug}</p>
        ) : (
          <Skeleton className="h-6 w-20" />
        )}
        {!loading ? (
          <h1 className="w-full truncate text-3xl font-bold">{title}</h1>
        ) : (
          <Skeleton className="h-8 w-36 max-w-full" />
        )}
      </div>
      <div>{children}</div>
    </header>
  );
}
