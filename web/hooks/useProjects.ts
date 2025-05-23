"use client";

import { Query } from "appwrite";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/hooks/userSession";
import { Project } from "@/interfaces/project.interface";
import { getUserById } from "@/lib/auth";
import { DATABASE_ID, PROJECT_COLLECTION_ID } from "@/lib/constants";
import { listProjectsByTeam } from "@/lib/db/project";
import { getTeamById } from "@/lib/team";
import { Models } from "node-appwrite";

interface Props {
  initialProjects?: Models.DocumentList<Project>;
  teamId?: string;
  userId?: string;
  searchTerm?: string;
  limit?: number;
  cursor?: string;
}

export const useProjects = ({
  initialProjects,
  teamId,
  userId,
  searchTerm,
  limit = 5,
  cursor,
}: Props) => {
  const [projects, setProjects] = useState<Project[]>(
    initialProjects?.documents ?? [],
  );
  const [loading, setLoading] = useState<boolean>(
    initialProjects ? false : true,
  );
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalProjects, setTotalProjects] = useState<number>(
    initialProjects?.total ?? 0,
  );
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState<boolean>(
    !!initialProjects && !cursor && !searchTerm,
  );

  const { client, loading: sessionLoading } = useSession();

  useEffect(() => {
    setLoading(sessionLoading);
  }, [sessionLoading]);

  useEffect(() => {
    if (initialLoad) {
      if (initialProjects && initialProjects.documents.length > 0) {
        const lastDocument =
          initialProjects.documents[initialProjects.documents.length - 1];
        setNextCursor(lastDocument?.$id);
        setHasMore(initialProjects.documents.length === limit);
      }
      return;
    }

    const fetchProjects = async () => {
      if (!teamId) return;

      setLoading(true);

      try {
        const queries = [Query.orderAsc("ordinal")];

        if (searchTerm && searchTerm.trim() !== "") {
          queries.push(Query.search("name", searchTerm));
        }

        queries.push(Query.limit(limit));

        if (cursor) {
          queries.push(Query.cursorAfter(cursor));
        }

        console.log("queries", queries);

        const result = await listProjectsByTeam(teamId, queries);

        if (result.success && result.data) {
          if (cursor) {
            setProjects((prev) => [...prev, ...(result.data?.documents || [])]);
          } else {
            setProjects(result.data.documents);
          }

          setTotalProjects(result.data.total);

          const lastDocument =
            result.data.documents[result.data.documents.length - 1];
          setNextCursor(lastDocument?.$id);

          setHasMore(result.data.documents.length === limit);
        } else {
          toast.error(result.message);
          if (!cursor) {
            setProjects([]);
          }
          setHasMore(false);
          setNextCursor(undefined);
        }
      } catch (error) {
        if (!cursor) {
          setProjects([]);
        }
        setHasMore(false);
        setNextCursor(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [teamId, userId, searchTerm, limit, cursor, initialLoad]);

  useEffect(() => {
    if (searchTerm || cursor) {
      setInitialLoad(false);
    }
  }, [searchTerm, cursor]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (client) {
      unsubscribe = client.subscribe<Project>(
        `databases.${DATABASE_ID}.collections.${PROJECT_COLLECTION_ID}.documents`,
        async (response) => {
          if (teamId && response.payload.teamId !== teamId) return;
          if (userId && response.payload.userId !== userId) return;

          if (searchTerm === undefined) {
            if (
              response.events.includes(
                "databases.*.collections.*.documents.*.create",
              )
            ) {
              const { data } = await getUserById(response.payload.userId);
              const { data: teamData } = await getTeamById(
                response.payload.teamId,
              );

              setProjects((prev) => [
                ...prev,
                {
                  ...response.payload,
                  user: data,
                  team: teamData,
                },
              ]);

              setTotalProjects((prev) => prev + 1);
            }

            if (
              response.events.includes(
                "databases.*.collections.*.documents.*.update",
              )
            ) {
              const { data } = await getUserById(response.payload.userId);
              const { data: teamData } = await getTeamById(
                response.payload.teamId,
              );

              setProjects((prev) =>
                prev.map((x) =>
                  x.$id === response.payload.$id
                    ? { user: data, ...response.payload, team: teamData }
                    : x,
                ),
              );
            }

            if (
              response.events.includes(
                "databases.*.collections.*.documents.*.delete",
              )
            ) {
              setProjects((prev) =>
                prev.filter((x) => x.$id !== response.payload.$id),
              );
              setTotalProjects((prev) => prev - 1);
            }
          }
        },
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [client, teamId, userId, searchTerm]);

  return { projects, loading, hasMore, totalProjects, nextCursor };
};
