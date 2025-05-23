"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { ID, Models, Permission, Query, Role } from "node-appwrite";

import { Experience } from "@/interfaces/experience.interface";
import { Result } from "@/interfaces/result.interface";
import { withAuth } from "@/lib/auth";
import { DATABASE_ID, EXPERIENCE_COLLECTION_ID } from "@/lib/constants";
import { createSessionClient } from "@/lib/server/appwrite";
import { EditExperienceFormData } from "./schemas";

/**
 * Get a list of experiences for a team
 * @param {string} teamId The ID of the team
 * @param {string[]} queries The queries to filter the experiences
 * @returns {Promise<Result<Models.DocumentList<Experience>>>} The list of experiences
 */
export async function listExperiences(
  teamId: string,
  queries: string[] = [],
): Promise<Result<Models.DocumentList<Experience>>> {
  return withAuth(async (user) => {
    const { database } = await createSessionClient();

    return unstable_cache(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (teamId, queries, userId) => {
        try {
          const experiences = await database.listDocuments<Experience>(
            DATABASE_ID,
            EXPERIENCE_COLLECTION_ID,
            [Query.equal("teamId", teamId), ...queries],
          );

          return {
            success: true,
            message: "Experiences successfully retrieved.",
            data: experiences,
          };
        } catch (err) {
          const error = err as Error;

          console.error(error);

          return {
            success: false,
            message: error.message,
          };
        }
      },
      ["experiences", teamId],
      {
        tags: [
          "experiences",
          `experiences:team-${teamId}`,
          `experiences:team-${teamId}:${queries.join("-")}`,
        ],
        revalidate: 600,
      },
    )(teamId, queries, user.$id);
  });
}

/**
 * Create an experience
 * @param {Object} params The parameters for creating an experience
 * @param {string} [params.id] The ID of the experience (optional)
 * @param {EditExperienceFormData} params.data The experience data
 * @param {string} params.teamId The ID of the team
 * @param {string[]} [params.permissions] The permissions for the experience (optional)
 * @returns {Promise<Result<Experience>>} The created experience
 */
export async function createExperience({
  id = ID.unique(),
  data,
  teamId,
  permissions = [],
}: {
  id?: string;
  data: EditExperienceFormData;
  teamId: string;
  permissions?: string[];
}): Promise<Result<Experience>> {
  return withAuth(async (user) => {
    const { database } = await createSessionClient();

    permissions = [
      ...permissions,
      Permission.read(Role.user(user.$id)),
      Permission.write(Role.user(user.$id)),
      Permission.read(Role.team(teamId)),
      Permission.write(Role.team(teamId)),
    ];

    try {
      const experience = await database.createDocument<Experience>(
        DATABASE_ID,
        EXPERIENCE_COLLECTION_ID,
        id,
        {
          ...data,
          website:
            data.website && data.website != ""
              ? new URL(data.website)
              : undefined,
          skills:
            data.skills?.map((skill) =>
              typeof skill === "string" ? skill : skill.value,
            ) || [],
          userId: user.$id,
          teamId,
        },
        permissions,
      );

      revalidateTag(`experiences:team-${teamId}`);
      revalidateTag(`experience:${experience.$id}`);
      revalidateTag(`team:${teamId}`);

      return {
        success: true,
        message: "Experience successfully created.",
        data: experience,
      };
    } catch (err) {
      const error = err as Error;

      // Logging to Vercel
      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  });
}

/**
 * Update an experience
 * @param {Object} params The parameters for updating an experience
 * @param {string} params.id The ID of the experience
 * @param {EditExperienceFormData} params.data The experience data
 * @param {string[]} [params.permissions] The permissions for the experience (optional)
 * @returns {Promise<Result<Experience>>} The updated experience
 */
export async function updateExperience({
  id,
  data,
  permissions = undefined,
}: {
  id: string;
  data: EditExperienceFormData;
  permissions?: string[];
}): Promise<Result<Experience>> {
  return withAuth(async (user) => {
    const { database } = await createSessionClient();

    try {
      await database.getDocument<Experience>(
        DATABASE_ID,
        EXPERIENCE_COLLECTION_ID,
        id,
      );

      delete data.id;

      const experience = await database.updateDocument<Experience>(
        DATABASE_ID,
        EXPERIENCE_COLLECTION_ID,
        id,
        {
          ...data,
          userId: user.$id,
          skills: data.skills?.map((x) => x.label) || [],
        },
        permissions,
      );

      revalidateTag(`experiences:team-${experience.teamId}`);
      revalidateTag(`experience:${experience.$id}`);
      revalidateTag(`team:${experience.teamId}`);

      return {
        success: true,
        message: "Experience successfully updated.",
        data: experience,
      };
    } catch (err) {
      const error = err as Error;

      // Logging to Vercel
      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  });
}

/**
 * Delete an experience
 * @param {string} id The ID of the experience
 * @returns {Promise<Result<Experience>>} The deleted experience
 */
export async function deleteExperience(
  id: string,
): Promise<Result<Experience>> {
  return withAuth(async () => {
    const { database } = await createSessionClient();

    try {
      const experience = await database.getDocument<Experience>(
        DATABASE_ID,
        EXPERIENCE_COLLECTION_ID,
        id,
      );

      await database.deleteDocument(DATABASE_ID, EXPERIENCE_COLLECTION_ID, id);

      revalidateTag(`experiences:team-${experience.teamId}`);
      revalidateTag(`experience:${experience.$id}`);
      revalidateTag(`team:${experience.teamId}`);

      return {
        success: true,
        message: "Experience successfully deleted.",
        data: experience,
      };
    } catch (err) {
      const error = err as Error;

      // Logging to Vercel
      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  });
}

/**
 * Update multiple experiences for a team
 * @param {Object} params The parameters for updating experiences
 * @param {string} params.teamId The ID of the team
 * @param {EditExperienceFormData[]} params.experiences The experience data array
 * @returns {Promise<Result<{ added: number, updated: number, deleted: number, failed: number }>>} Results summary
 */
export async function updateMultipleExperiences({
  teamId,
  experiences,
}: {
  teamId: string;
  experiences: EditExperienceFormData[];
}): Promise<
  Result<{ added: number; updated: number; deleted: number; failed: number }>
> {
  return withAuth(async () => {
    try {
      const existingExperiencesResult = await listExperiences(teamId);

      if (!existingExperiencesResult.success) {
        return {
          success: false,
          message: existingExperiencesResult.message,
        };
      }

      const existingExperiences =
        existingExperiencesResult.data?.documents || [];

      const newExperienceIds = experiences
        .filter((exp) => exp.id)
        .map((exp) => exp.id as string);

      const toDelete = existingExperiences.filter(
        (exp) => !newExperienceIds.includes(exp.$id),
      );

      let deletedCount = 0;
      let failedCount = 0;

      for (const exp of toDelete) {
        const result = await deleteExperience(exp.$id);
        if (result.success) deletedCount++;
        else failedCount++;
      }

      let updatedCount = 0;
      let addedCount = 0;

      for (const exp of experiences) {
        if (exp.id) {
          const result = await updateExperience({
            id: exp.id,
            data: exp,
          });
          if (result.success) updatedCount++;
          else failedCount++;
        } else {
          const result = await createExperience({
            data: exp,
            teamId,
          });
          if (result.success) addedCount++;
          else failedCount++;
        }
      }

      revalidateTag(`experiences:team-${teamId}`);
      revalidateTag(`team:${teamId}`);

      return {
        success: true,
        message: `Experiences updated: ${addedCount} added, ${updatedCount} updated, ${deletedCount} deleted, ${failedCount} failed.`,
        data: {
          added: addedCount,
          updated: updatedCount,
          deleted: deletedCount,
          failed: failedCount,
        },
      };
    } catch (err) {
      const error = err as Error;

      // Logging to Vercel
      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  });
}

/**
 * Delete all experiences for a team
 * @param teamId The ID of the team
 * @returns {Promise<Result<void>>} The result of the operation
 */
export async function deleteAllExperienceByTeam(
  teamId: string,
): Promise<Result<void>> {
  return withAuth(async () => {
    const { database } = await createSessionClient();

    try {
      let response;
      const queries = [Query.limit(50), Query.equal("teamId", teamId)];

      do {
        response = await database.listDocuments<Experience>(
          DATABASE_ID,
          EXPERIENCE_COLLECTION_ID,
          queries,
        );

        await Promise.all(
          response.documents.map((document) => deleteExperience(document.$id)),
        );
      } while (response.documents.length > 0);

      revalidateTag(`experiences:team-${teamId}`);

      return {
        success: true,
        message: "Experience successfully deleted.",
      };
    } catch (err) {
      const error = err as Error;

      // Logging to Vercel
      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  });
}
