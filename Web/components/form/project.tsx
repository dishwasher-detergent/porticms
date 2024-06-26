"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrayInput } from "@/components/ui/form/array";
import { ImageArrayInput } from "@/components/ui/form/image-array";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Projects } from "@/interfaces/projects";
import {
  auth_service,
  database_service,
  storage_service,
} from "@/lib/appwrite";
import { PROJECTS_BUCKET_ID, PROJECTS_COLLECTION_ID } from "@/lib/constants";
import { createSlug } from "@/lib/utils";
import { usePortfolioStore } from "@/store/zustand";
import { zodResolver } from "@hookform/resolvers/zod";
import { ID, Permission, Role } from "appwrite";
import { LucideLoader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { DynamicDrawer } from "../ui/dynamic-drawer";

const formSchema = z.object({
  title: z.string().min(1).max(128),
  short_description: z.string().min(1).max(128),
  description: z.string().min(1).max(1024),
  images: z.array(
    z.object({
      value: z.any(),
    }),
  ),
  position: z.coerce.number().min(1),
  tags: z.optional(
    z.array(
      z.object({
        value: z.string().min(1).max(128),
      }),
    ),
  ),
  links: z.optional(
    z.array(
      z.object({
        value: z.string().min(1).max(128),
      }),
    ),
  ),
  color: z.string().min(1).max(128),
});

interface CreateProjectFormProps {
  title?: string;
  data?: Projects;
}

export const CreateProjectForm = ({
  title = "Create",
  data,
}: CreateProjectFormProps) => {
  const edit = data ? true : false;
  const router = useRouter();
  const { current } = usePortfolioStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title ?? "",
      short_description: data?.short_description ?? "",
      description: data?.description ?? "",
      images: data?.images.map((x) => ({ value: x })) ?? [],
      position: data?.position ?? 1,
      tags: data?.tags.map((x) => ({ value: x })) ?? [],
      links: data?.links.map((x) => ({ value: x })) ?? [],
      color: data?.color ?? "#ffffff",
    },
  });

  async function deleteProject() {
    if (!data) return;

    try {
      await database_service.delete(PROJECTS_COLLECTION_ID, data?.$id);

      toast.success(`Project ${data.title} deleted successfully.`);

      router.push(`/portfolio/projects`);
    } catch (err) {
      toast.error("An error occurred while deleting your project.");
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let images = [];

    const existing_images =
      values?.images
        .filter((x) => typeof x.value == "string")
        .map((x) => x.value) ?? [];

    try {
      if (values.images) {
        for (let i = 0; i < values.images.length; i++) {
          if (
            values.images[i].value &&
            typeof values.images[i].value !== "string"
          ) {
            const response = await storage_service.upload(
              PROJECTS_BUCKET_ID,
              values.images[i].value[0],
            );

            images.push(response.$id);

            toast.success(`Image ${response.name} uploaded successfully.`);
          }
        }
      }
    } catch (err) {
      toast.error("An error occurred while uploading your images.");
    }

    images = [...existing_images, ...images];

    const slug = createSlug(values.title);

    const project = {
      title: values.title,
      short_description: values.short_description,
      description: values.description,
      images: images,
      position: values.position,
      tags: values.tags?.map((x) => x.value),
      links: values.links?.map((x) => x.value),
      color: values.color,
      slug: slug,
      portfolios: current?.id,
    };

    try {
      if (data) {
        await database_service.update<Projects>(
          PROJECTS_COLLECTION_ID,
          project,
          data.$id,
        );

        toast.success(`Project ${values.title} updated successfully.`);
      } else {
        const user = await auth_service.getAccount();

        await database_service.create<Projects>(
          PROJECTS_COLLECTION_ID,
          { ...project, creator: user.$id },
          ID.unique(),
          [Permission.read(Role.any()), Permission.write(Role.user(user.$id))],
        );

        toast.success(`Project ${values.title} created successfully.`);

        router.push(`/portfolio/${current?.id}/projects/${slug}`);
      }
    } catch (err) {
      const error = err as Error;

      toast.error("An error occurred while creating your project.");

      if (
        error.message.includes("Document with the requested ID already exists.")
      ) {
        form.setError("title", {
          type: "manual",
          message: "Project with this title already exists.",
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Sample Project" {...field} />
                </FormControl>
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
                  <Textarea placeholder="This project is amazing!" {...field} />
                </FormControl>
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
                  <Textarea
                    placeholder="This project is really really amazing!"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ImageArrayInput form={form} title="Images" name="images" />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ArrayInput form={form} title="Tags" name="tags" />
          <ArrayInput form={form} title="Links" name="links" />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <input
                    placeholder="#FFFFFF"
                    type="color"
                    className="block h-10 w-14 cursor-pointer rounded-lg border border-gray-200 bg-white p-1 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-slate-900"
                    title="Choose your color"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <footer className="flex flex-row justify-end">
          {edit && (
            <div className="flex-1">
              <DynamicDrawer
                title="Are you sure absolutely sure?"
                buttonText="Delete"
              >
                <div className="flex flex-col gap-4">
                  <p>
                    This action cannot be undone. This will permanently delete
                    this project.
                  </p>
                  <div className="md:flex md:justify-end">
                    <Button variant="destructive" onClick={deleteProject}>
                      Delete
                    </Button>
                  </div>
                </div>
              </DynamicDrawer>
            </div>
          )}
          <div className="flex flex-none flex-row gap-2">
            <Button
              disabled={form.formState.isSubmitting}
              type="button"
              variant="destructive"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </footer>
      </form>
    </Form>
  );
};
