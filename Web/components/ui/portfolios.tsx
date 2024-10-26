"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Portfolios } from "@/interfaces/portfolios";
import { database_service } from "@/lib/appwrite";
import { PORTFOLIO_COLLECTION_ID } from "@/lib/constants";
import { usePortfolioStore } from "@/store/zustand";
import { LucidePlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const PortfoliosSelect = () => {
  const { current, update } = usePortfolioStore();
  const router = useRouter();
  const params = useParams();

  const [portfolios, setPortfolios] = useState<Portfolios[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPortfolios() {
      if (!current) return;

      setLoading(true);

      const res = await database_service.list<Portfolios>(
        PORTFOLIO_COLLECTION_ID,
      );

      setPortfolios(res.documents);
      setLoading(false);
    }

    fetchPortfolios();
  }, [current]);

  useEffect(() => {
    usePortfolioStore.persist.rehydrate();
  }, []);

  return !loading ? (
    <Select
      onValueChange={(e) => {
        const data = JSON.parse(e);

        update(data);
        router.push(`/portfolio/${data.id}`);
      }}
      value={`{"id": "${current?.id}", "title": "${current?.title}"}`}
    >
      <SelectTrigger className="w-32 truncate border-none bg-background font-semibold shadow-none">
        <SelectValue
          placeholder="Select a Portfolio"
          defaultValue={params.port_slug}
        />
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
        {portfolios.map((item) => (
          <SelectItem
            key={item.$id}
            value={`{"id": "${item.$id}", "title": "${item.title}"}`}
          >
            {item.title}
          </SelectItem>
        ))}
        <Separator className="my-2" />
        <Link
          href={`/portfolio/create`}
          className="relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
        >
          Create
          <LucidePlus className="ml-2 h-4 w-4" />
        </Link>
      </SelectContent>
    </Select>
  ) : (
    <Skeleton className="h-6 w-24" />
  );
};
