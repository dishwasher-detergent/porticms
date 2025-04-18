"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LucideLoader2, LucideUserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { DyanmicDrawer } from "@/components/ui/dynamic-drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TeamData } from "@/interfaces/team.interface";
import { inviteMember } from "@/lib/team";
import { InviteTeamFormData, inviteTeamSchema } from "@/lib/team/schemas";
import { cn } from "@/lib/utils";

export function InviteTeam({ team }: { team: TeamData }) {
  const [open, setOpen] = useState(false);

  return (
    <DyanmicDrawer
      title={`Invite Someone!`}
      description="Invite someone to your team."
      open={open}
      setOpen={setOpen}
      button={
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
        >
          Invite
          <DropdownMenuShortcut>
            <LucideUserRoundPlus className="size-3.5" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      }
    >
      <InviteForm setOpen={setOpen} team={team} />
    </DyanmicDrawer>
  );
}

interface FormProps extends React.ComponentProps<"form"> {
  setOpen: (e: boolean) => void;
  team: TeamData;
}

function InviteForm({ className, setOpen, team }: FormProps) {
  const form = useForm<InviteTeamFormData>({
    resolver: zodResolver(inviteTeamSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: InviteTeamFormData) {
    const data = await inviteMember(team.$id, values.email);

    if (data.success) {
      toast.success(data.message);
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    placeholder="user@example.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          Invite To Team
          {form.formState.isSubmitting ? (
            <LucideLoader2 className="size-3.5 animate-spin" />
          ) : (
            <LucideUserRoundPlus className="size-3.5" />
          )}
        </Button>
      </form>
    </Form>
  );
}
