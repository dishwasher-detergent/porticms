"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { LucideLoader2, LucideSave } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { organizationIdAtom } from "@/atoms/organization";
import { AutosizeTextarea } from "@/components/ui/auto-size-textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MultiplePhotoSelector } from "@/components/ui/multiple-photo-selector";
import MultipleSelector from "@/components/ui/multiple-selector";
import { Project } from "@/interfaces/project.interface";
import { deleteFile, updateProject, uploadFile } from "@/lib/utils";
import { TAGS } from "./options";
import projectSchema, {
  descriptionMaxLength,
  shortDescriptionMaxLength,
  titleMaxLength,
} from "./schema";

interface ProjectFormProps extends Project {}

export default function ProjectForm({
  setProject,
  $id,
  title,
  description,
  short_description,
  tags,
  links,
  image_ids,
}: ProjectFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const organizationId = useAtomValue(organizationIdAtom);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: title ?? "",
      description: description ?? "",
      short_description: short_description ?? "",
      tags: tags.map((tag) => ({ label: tag, value: tag })),
      links: links.map((link) => ({ label: link, value: link })),
      image_ids: image_ids,
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    setLoading(true);

    const images = await handleFiles(values.image_ids);

    const formData = {
      ...values,
      tags: values?.tags?.map((tag) => tag.value) ?? [],
      links: values?.links?.map((link) => link.value) ?? [],
      image_ids: images,
    };

    const updatedProject = await updateProject($id, formData);

    if (updatedProject) {
      setProject(updatedProject);
    }

    setLoading(false);
  }

  async function handleFiles(images: any[] | undefined) {
    if (!images || !organizationId) {
      return;
    }

    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        if (image instanceof File) {
          const data = await uploadFile(image, organizationId.id);
          return data ? data.$id : null;
        }
        return image;
      }),
    );

    const validUploadedImages = uploadedImages.filter(Boolean);
    const removedImages = image_ids.filter(
      (image_id) => !images.includes(image_id),
    );

    await Promise.all(
      removedImages.map(async (image_id) => await deleteFile(image_id)),
    );

    return validUploadedImages;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="Sample Project"
                    className="truncate pr-20"
                    maxLength={titleMaxLength}
                  />
                  <Badge
                    className="absolute right-1.5 top-1/2 -translate-y-1/2"
                    variant="secondary"
                  >
                    {field?.value?.length}/{titleMaxLength}
                  </Badge>
                </div>
              </FormControl>
              <FormDescription>Name your project.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div className="relative">
                  <AutosizeTextarea
                    {...field}
                    placeholder="This is a full length description."
                    className="pb-8"
                    maxLength={descriptionMaxLength}
                  />
                  <Badge
                    className="absolute bottom-2 left-2"
                    variant="secondary"
                  >
                    {field?.value?.length}/{descriptionMaxLength}
                  </Badge>
                </div>
              </FormControl>
              <FormDescription>Describe your project here.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <div className="relative">
                  <AutosizeTextarea
                    {...field}
                    placeholder="This is a short description."
                    className="pb-8"
                    maxLength={shortDescriptionMaxLength}
                  />
                  <Badge
                    className="absolute bottom-2 left-2"
                    variant="secondary"
                  >
                    {field?.value?.length}/{shortDescriptionMaxLength}
                  </Badge>
                </div>
              </FormControl>
              <FormDescription>
                Give your projects elevator pitch here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <MultiplePhotoSelector {...field} />
              </FormControl>
              <FormDescription>
                Let people, at a glance, know how you&apos;ve built your
                project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultipleSelector
                  {...field}
                  defaultOptions={TAGS}
                  creatable
                  emptyIndicator={
                    <p className="text-center leading-4 text-gray-600 dark:text-gray-400">
                      No results found.
                    </p>
                  }
                />
              </FormControl>
              <FormDescription>
                Let people, at a glance, know how you&apos;ve built your
                project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="links"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Links</FormLabel>
              <FormControl>
                <MultipleSelector
                  {...field}
                  creatable
                  emptyIndicator={
                    <p className="text-center leading-4 text-gray-600 dark:text-gray-400">
                      No results found.
                    </p>
                  }
                />
              </FormControl>
              <FormDescription>
                Add links to your projects site, repo, or anything else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <LucideLoader2 className="mr-2 size-3.5 animate-spin" />
          ) : (
            <LucideSave className="mr-2 size-3.5" />
          )}
          Save
        </Button>
      </form>
    </Form>
  );
}
