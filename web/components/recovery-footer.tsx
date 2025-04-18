import Link from "next/link";

import { Button } from "@/components/ui/button";

export function RecoveryFooter() {
  return (
    <>
      <p className="text-muted-foreground text-sm">
        Don&apos;t have an account?
        <Button
          variant="link"
          asChild
          className="text-muted-foreground p-1 text-sm"
        >
          <Link href="/signup" className="underline">
            Sign Up Here
          </Link>
        </Button>
      </p>
      <p className="text-muted-foreground text-sm">
        Remember your password?
        <Button
          variant="link"
          asChild
          className="text-muted-foreground p-1 text-sm"
        >
          <Link href="/signin" className="underline">
            Sign In Here
          </Link>
        </Button>
      </p>
    </>
  );
}
