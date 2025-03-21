"use client";

import { Logout } from "@/components/logout";
import { Organization } from "@/components/organization";
import { Project } from "@/components/project";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";

export function Nav() {
  const segments = useSelectedLayoutSegments();

  const subNav = useMemo<React.ReactNode>(() => {
    if (segments[3] === "project") {
      return (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link
              href={`/organization/${segments[2]}/project/${segments[4]}/api`}
            >
              API
            </Link>
          </Button>
        </>
      );
    }

    if (segments[1] === "organization") {
      return (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/organization/${segments[2]}/information`}>
              Information
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/organization/${segments[2]}/experience`}>
              Experience
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/organization/${segments[2]}/api`}>API</Link>
          </Button>
        </>
      );

      return null;
    }

    return "";
  }, [segments]);

  if (segments[0] != "(portfolio)") return null;

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/90 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl flex-row items-center justify-between gap-2 p-4 md:px-8">
        <div className="flex flex-row items-center gap-2">
          <Organization />
          /
          <Project />
        </div>
        <div>
          <Logout />
        </div>
      </div>
      {subNav && (
        <div className="border-t bg-muted/40">
          <div className="mx-auto flex max-w-6xl flex-row items-center gap-2 px-4 py-2 md:px-8">
            {subNav}
          </div>
        </div>
      )}
    </header>
  );
}
