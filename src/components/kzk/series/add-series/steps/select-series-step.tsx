"use client";

import { type AddSeriesState } from "@/components/kzk/series/add-series";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Series } from "@/server/api/routers/series";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useDebounce } from "use-debounce";

export function SelectSeriesStep({
  setError,
  setIsLoading,
  setCanProgress,
  formState,
  setFormState,
}: {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCanProgress: React.Dispatch<React.SetStateAction<boolean>>;
  formState: AddSeriesState;
  setFormState: React.Dispatch<React.SetStateAction<AddSeriesState>>;
}) {
  const [availableSeries, setAvailableSeries] = React.useState<Series[]>([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedSearchValue] = useDebounce(searchValue, 500);

  const availableSeriesQuery = api.series.availableSeries.useQuery(
    {
      sourceId: formState.source?.id ?? "",
      keyword: debouncedSearchValue,
    },
    {
      enabled:
        !!formState.source &&
        (!debouncedSearchValue || debouncedSearchValue.length >= 3),
    },
  );

  React.useEffect(() => {
    setAvailableSeries(availableSeriesQuery.data ?? []);
  }, [availableSeriesQuery.data]);

  React.useEffect(() => {
    setIsLoading(
      availableSeriesQuery.isLoading ||
        availableSeriesQuery.isFetching ||
        availableSeriesQuery.isRefetching,
    );
  }, [
    availableSeriesQuery.isFetching,
    availableSeriesQuery.isLoading,
    availableSeriesQuery.isRefetching,
    setIsLoading,
  ]);

  React.useEffect(() => {
    if (
      availableSeriesQuery.isError ||
      availableSeriesQuery.isLoadingError ||
      availableSeriesQuery.isRefetchError
    ) {
      setError(availableSeriesQuery.error.message);
    } else {
      setError(null);
    }
  }, [
    availableSeriesQuery.error,
    availableSeriesQuery.isError,
    availableSeriesQuery.isLoadingError,
    availableSeriesQuery.isRefetchError,
    setError,
  ]);

  return (
    <div className="mt-4 grid gap-2 rounded-md border bg-secondary p-4">
      <div>
        <Input
          onPointerDown={(e) => e.stopPropagation()}
          type="search"
          placeholder="Search for a series..."
          className="mb-2 bg-card"
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <RadioGroup
        className="h-96 overflow-y-auto"
        onValueChange={(value) => {
          setCanProgress(value !== null);
          setFormState({
            ...formState,
            series: {
              id: Number.parseInt(value),
              name:
                availableSeries.find((series) => series.id.toString() === value)
                  ?.title ?? value,
            },
          });
        }}
      >
        <div className="flex flex-wrap gap-2 self-start sm:gap-4">
          {availableSeries.map((series) => {
            return (
              <Label
                key={series.id}
                className="max-w-1/2 relative flex h-40 max-h-40 w-1/2 basis-full cursor-pointer flex-row items-center gap-2 overflow-hidden rounded-md bg-card p-2 text-xs hover:bg-primary hover:text-primary-foreground has-checked-button:bg-primary has-checked-button:text-primary-foreground sm:basis-1/2-gap-4 sm:text-sm"
                htmlFor={series.id.toString()}
              >
                <div className="relative h-full shrink-0 grow-0 basis-4/12">
                  <Image
                    src={series.thumbnailUrl}
                    alt={series.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 100vw"
                    className="h-auto w-auto rounded-md object-cover"
                  />
                  <Badge
                    variant="secondary"
                    className="absolute bottom-0 left-0 right-0 transform items-center justify-center rounded-none rounded-b-sm text-xs font-light capitalize"
                  >
                    {series.status?.toLocaleLowerCase().replaceAll("_", " ") ??
                      "Unknown"}
                  </Badge>
                  {series.realUrl && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={series.realUrl}
                          target="_blank"
                          className="absolute left-1 top-1 rounded-sm bg-card p-1 text-secondary-foreground hover:bg-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-card">
                        Open Source Page
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex h-full basis-8/12 flex-col overflow-hidden">
                  <span className="line-clamp-1 font-semibold">
                    {series.title}
                  </span>
                  <span className="author line-clamp-1 text-xs">
                    {series.author}
                  </span>
                  <span className="line-clamp-1 py-3 text-xs">
                    {series.genre
                      ?.filter((genre) => !!genre)
                      .slice(0, 2)
                      .map((genre) => {
                        return (
                          <span
                            key={genre}
                            className="mr-1 rounded-md border-none bg-secondary p-1 text-secondary-foreground"
                          >
                            {genre}
                          </span>
                        );
                      })}
                  </span>
                  <span className="line-clamp-4 text-xs font-light">
                    {series.description ?? "No Description"}
                  </span>
                </div>
                <RadioGroupItem
                  value={series.id.toString()}
                  id={series.id.toString()}
                  className="hidden h-5 w-5 border-2 hover:border-primary-foreground hover:text-primary-foreground is-checked-button:border-primary-foreground is-checked-button:text-primary-foreground"
                />
              </Label>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
