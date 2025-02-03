"use client";

import { api } from "@/trpc/react";
import Image from "next/image";

export function ListSeries() {
  const library = api.series.fetchLibrary.useQuery();

  if (library.isLoading) {
    return <div>Loading...</div>;
  }

  if (library.data === undefined || library.data?.length === 0) {
    return <div>No series found</div>;
  }

  return library.data.map((series) => {
    return (
      <div key={series.id} className="relative h-64 w-44 rounded-md shadow">
        <Image
          priority
          src={series.thumbnailUrl}
          alt={series.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 100vw"
          className="h-auto w-auto rounded-md object-cover"
        />
      </div>
    );
  });
}
