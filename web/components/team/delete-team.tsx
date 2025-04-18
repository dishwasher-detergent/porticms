"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LucideLoader2, LucideTrash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { DyanmicDrawer } from "@/components/ui/dynamic-drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TEAM_NAME_MAX_LENGTH } from "@/constants/team.constants";
import { TeamData } from "@/interfaces/team.interface";
import { setLastVisitedTeam } from "@/lib/auth";
import { deleteTeam } from "@/lib/team";
import { DeleteTeamFormData, deleteTeamSchema } from "@/lib/team/schemas";
import { cn } from "@/lib/utils";

export function DeleteTeam({ team }: { team: TeamData }) {
  const [open, setOpen] = useState(false);

  return (
    <DyanmicDrawer
      title={`Delete ${team.name}.`}
      description="This is permanent and cannot be undone, it will delete all projects made under the team."
      open={open}
      setOpen={setOpen}
      button={
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <LucideTrash2 className="size-3.5" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      }
    >
      <DeleteForm setOpen={setOpen} team={team} />
    </DyanmicDrawer>
  );
}

interface FormProps extends React.ComponentProps<"form"> {
  setOpen: (e: boolean) => void;
  team: TeamData;
}

function DeleteForm({ className, setOpen, team }: FormProps) {
  const router = useRouter();

  const form = useForm<DeleteTeamFormData>({
    resolver: zodResolver(deleteTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: DeleteTeamFormData) {
    if (values.name !== team.name) {
      form.setError("name", {
        message: "Name does not match.",
      });

      toast.error("Name does not match.");
      return;
    }

    const data = await deleteTeam(team.$id);

    if (data.success) {
      toast.success(data.message);
      await setLastVisitedTeam("");
      router.push("/app");
      setOpen(false);
    } else {
      toast.error(data.message);
    }

    setOpen(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "flex h-full flex-col gap-4 overflow-hidden p-4 md:p-0",
          className,
        )}
      >
        <div className="flex-1 space-y-4 overflow-auto p-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder={team.name}
                      className="truncate pr-20"
                      maxLength={TEAM_NAME_MAX_LENGTH}
                    />
                    <Badge
                      className="absolute top-1/2 right-1.5 -translate-y-1/2"
                      variant="secondary"
                    >
                      {field?.value?.length || 0}/{TEAM_NAME_MAX_LENGTH}
                    </Badge>
                  </div>
                </FormControl>
                <FormDescription>
                  Enter the team name to confirm deletion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          variant="destructive"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          Delete
          {form.formState.isSubmitting ? (
            <LucideLoader2 className="size-3.5 animate-spin" />
          ) : (
            <LucideTrash2 className="size-3.5" />
          )}
        </Button>
      </form>
    </Form>
  );
}
