import { redirect } from "next/navigation";

import { TeamMembers } from "@/components/team/team-members";
import { ADMIN_ROLE, OWNER_ROLE } from "@/constants/team.constants";
import { getCurrentUserRoles, listTeamMembers } from "@/lib/team";

export default async function TeamMembersPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { data, success } = await listTeamMembers(teamId);

  if (!success || !data) {
    redirect("/app");
  }

  const { data: roles } = await getCurrentUserRoles(teamId);

  const isOwner = roles!.includes(OWNER_ROLE);
  const isAdmin = roles!.includes(ADMIN_ROLE);

  return (
    <TeamMembers
      members={data ?? []}
      teamId={teamId}
      isOwner={isOwner}
      isAdmin={isAdmin}
    />
  );
}
