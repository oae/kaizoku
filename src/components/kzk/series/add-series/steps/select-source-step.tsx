"use client";

import { type AddSeriesState } from "@/components/kzk/series/add-series";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/trpc/react";
import React from "react";

import { Input } from "@/components/ui/input";
import { type Source } from "@/server/api/routers/series";
import Image from "next/image";

export function SelectSourceStep({
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
  const [availableSources, setAvailableSources] = React.useState<Source[]>([]);
  const [searchValue, setSearchValue] = React.useState("");

  const availableSourcesQuery = api.series.availableSources.useQuery();

  React.useEffect(() => {
    setAvailableSources(availableSourcesQuery.data ?? []);
  }, [availableSourcesQuery.data]);

  React.useEffect(() => {
    if (!searchValue) {
      setAvailableSources(availableSourcesQuery.data ?? []);
    } else {
      const filteredSources = availableSourcesQuery.data?.filter(
        (source) =>
          source.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          source.displayName.toLowerCase().includes(searchValue.toLowerCase()),
      );
      setAvailableSources(filteredSources ?? []);
    }
  }, [availableSourcesQuery.data, searchValue]);

  React.useEffect(() => {
    setIsLoading(
      availableSourcesQuery.isLoading ||
        availableSourcesQuery.isFetching ||
        availableSourcesQuery.isRefetching,
    );
  }, [
    availableSourcesQuery.isFetching,
    availableSourcesQuery.isLoading,
    availableSourcesQuery.isRefetching,
    setIsLoading,
  ]);

  React.useEffect(() => {
    if (
      availableSourcesQuery.isError ||
      availableSourcesQuery.isLoadingError ||
      availableSourcesQuery.isRefetchError
    ) {
      setError(availableSourcesQuery.error.message);
    } else {
      setError(null);
    }
  }, [
    availableSourcesQuery.error,
    availableSourcesQuery.isError,
    availableSourcesQuery.isLoadingError,
    availableSourcesQuery.isRefetchError,
    setError,
  ]);

  return (
    <div className="mt-4 grid gap-2 rounded-md border bg-secondary p-4">
      <div>
        <Input
          onPointerDown={(e) => e.stopPropagation()}
          type="search"
          placeholder="Search for a source..."
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
            source: {
              id: value,
              name:
                availableSources.find((source) => source.id === value)
                  ?.displayName ?? value,
            },
          });
        }}
      >
        <div className="flex flex-wrap gap-2 self-start sm:gap-4">
          {availableSources.map((source) => {
            return (
              <Label
                key={source.id}
                className="max-w-1/3 basis-1/2-gap-2 flex h-16 max-h-16 w-1/3 cursor-pointer items-center gap-2 rounded-md bg-card p-2 text-xs hover:bg-primary hover:text-primary-foreground has-checked-button:bg-primary has-checked-button:text-primary-foreground sm:basis-1/3-gap-4 sm:text-sm"
                htmlFor={source.id}
              >
                <Image
                  src={source.iconUrl}
                  alt={source.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="flex-1 overflow-hidden text-ellipsis text-nowrap">
                  {source.displayName}
                </span>
                <RadioGroupItem
                  value={source.id}
                  id={source.id}
                  className="h-5 w-5 hidden border-2 hover:border-primary-foreground hover:text-primary-foreground is-checked-button:border-primary-foreground is-checked-button:text-primary-foreground"
                />
              </Label>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
