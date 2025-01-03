"use client";

import { organizationIdAtom } from "@/atoms/organization";
import { projectIdAtom, projectsAtom } from "@/atoms/project";
import { CreateProject } from "@/components/create-project";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Project as ProjectItem } from "@/interfaces/project.interface";
import { createClient } from "@/lib/client/appwrite";
import { DATABASE_ID, PROJECTS_COLLECTION_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { Query } from "appwrite";
import { useAtom, useAtomValue } from "jotai";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Project() {
  const router = useRouter();

  const organizationId = useAtomValue(organizationIdAtom);
  const [projectId, setprojectId] = useAtom(projectIdAtom);
  const [projects, setProjects] = useAtom(projectsAtom);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchProjects() {
    setLoading(true);
    const { database } = await createClient();

    const data = await database.listDocuments<ProjectItem>(
      DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      [Query.equal("organization_id", organizationId!.id)],
    );

    setProjects(data.documents);
    setLoading(false);
  }

  useEffect(() => {
    if (!organizationId) return;
    fetchProjects();
  }, [organizationId]);

  if (!organizationId) return <Skeleton className="h-8 min-w-32" />;

  return (
    <>
      {projects.length == 0 && !loading ? (
        <div className="flex w-32">
          <CreateProject />
        </div>
      ) : null}
      {loading && <Skeleton className="h-8 min-w-32" />}
      {projects.length > 0 && !loading && (
        <div className="flex flex-col gap-1 md:flex-row">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                onClick={() => setOpen(!open)}
                size="sm"
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className="text-muted-foreground"
              >
                {projectId?.title ?? "Select Project..."}
                <ChevronsUpDown className="ml-2 size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput
                  className="h-8 text-xs"
                  placeholder="Search project..."
                />
                <CommandList>
                  <CommandEmpty>No project found.</CommandEmpty>
                  <CommandGroup>
                    {projects.map((project) => (
                      <CommandItem
                        key={project.$id}
                        value={project.$id}
                        onSelect={(currentValue) => {
                          setprojectId({
                            title: project.title,
                            id: currentValue,
                          });
                          setOpen(false);
                          router.push(`/${organizationId.id}/${currentValue}`);
                        }}
                        className="cursor-pointer text-xs"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            projectId?.id === project.$id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {project.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="flex border-t p-1 md:justify-start">
                <CreateProject />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </>
  );
}
