"use client";

import Link from "next/link";

import { Badges } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Images } from "@/components/ui/images";
import { Links } from "@/components/ui/links";
import { Project } from "@/interfaces/project.interface";

export function ProjectCard(project: Project) {
  return (
    <Card className="break-inside-avoid-column rounded-md p-2">
      <CardContent className="p-0">
        {project.images.length > 0 && (
          <div className="mb-2">
            <Images images={project.images} />
          </div>
        )}
        <div className="space-y-2 p-2">
          <p className="text-lg font-bold">{project.name}</p>
          {project.tags.length > 0 && <Badges badges={project.tags} />}
          <p className="line-clamp-3 text-sm">
            {project.description ?? "No Description Added."}
          </p>
          {project.links.length > 0 && <Links links={project.links} />}
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/app/teams/${project.teamId}/projects/${project.$id}`}>
            Edit Project
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
