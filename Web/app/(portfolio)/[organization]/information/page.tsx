"use client";

import { organizationIdAtom } from "@/atoms/organization";
import InformationForm from "@/components/forms/information/form";
import InformationFormLoading from "@/components/forms/information/loading";
import { OrganizationSettings } from "@/components/organization-settings";
import { Card, CardContent } from "@/components/ui/card";
import { Information } from "@/interfaces/information.interface";
import { Organization } from "@/interfaces/organization.interface";
import { createClient } from "@/lib/client/appwrite";
import {
  DATABASE_ID,
  INFORMATION_COLLECTION_ID,
  ORGANIZATION_COLLECTION_ID,
} from "@/lib/constants";

import { useSetAtom } from "jotai";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Params = {
  organization: string;
};

export default function OrganizationInformation() {
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [information, setInformation] = useState<Information | null>(null);
  const { organization: organizationParam } = useParams<Params>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function validateOrganization() {
      setLoading(true);

      try {
        const { database } = await createClient();
        const org = await database.getDocument<Organization>(
          DATABASE_ID,
          ORGANIZATION_COLLECTION_ID,
          organizationParam,
        );

        if (!org) throw new Error("Missing organization.");

        const info = await database.getDocument<Information>(
          DATABASE_ID,
          INFORMATION_COLLECTION_ID,
          organizationParam,
        );

        setOrganizationId({
          title: org.title,
          id: org.$id,
        });
        setOrganization(org);
        setInformation(info);
        setLoading(false);
      } catch {
        setOrganizationId(null);
        router.push("/");
      }
    }

    validateOrganization();
  }, []);

  return (
    <main className="mx-auto min-h-full max-w-4xl p-4 px-4 md:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{organization?.slug}</p>
          <h1 className="text-3xl font-bold">{organization?.title}</h1>
        </div>
        <div>
          <OrganizationSettings />
        </div>
      </header>
      <Card className="p-4">
        <CardContent>
          {loading && <InformationFormLoading />}
          {information && (
            <InformationForm {...information} setInformation={setInformation} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}