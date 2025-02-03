"use client";
import { type AddSeriesState } from "@/components/kzk/series/add-series";
import { SelectFlowStep } from "@/components/kzk/series/add-series/steps/select-flow-step";
import { SelectSeriesStep } from "@/components/kzk/series/add-series/steps/select-series-step";
import { SelectSourceStep } from "@/components/kzk/series/add-series/steps/select-source-step";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Step,
  Stepper,
  useStepper,
  type StepItem,
} from "@/components/ui/stepper";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/react";
import {
  ArrowLeft,
  ArrowRight,
  Blocks,
  BookImage,
  Check,
  ExternalLink,
  LoaderCircle,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const steps = {
  source: {
    label: "Source",
    description: "Select a source",
    icon: Blocks,
  },
  series: {
    label: "Series",
    description: "Select a series",
    icon: BookImage,
  },
  flow: {
    label: "Flow",
    description: "Select a flow",
    icon: Workflow,
    optional: true,
  },
  // metadata: {
  //   label: "Metadata",
  //   description: "Add metadata",
  //   icon: BookPlus,
  // },
} satisfies Record<string, StepItem>;

export function AddSeriesSteps({ onFinish }: { onFinish: () => void }) {
  const [formState, setFormState] = React.useState<AddSeriesState>({});
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [canProgress, setCanProgress] = React.useState(false);

  return (
    <div className="flex w-full flex-col gap-4">
      <Stepper
        initialStep={0}
        steps={Object.values(steps)}
        variant="circle"
        state={isLoading ? "loading" : error ? "error" : undefined}
      >
        <Step
          label={steps.source.label}
          description={formState.source?.name ?? steps.source.description}
          icon={steps.source.icon}
        >
          <SelectSourceStep
            formState={formState}
            setFormState={setFormState}
            setError={setError}
            setIsLoading={setIsLoading}
            setCanProgress={setCanProgress}
          />
          {error && (
            <ul className="mb-4 list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              <li className="ml-4">{error}</li>
            </ul>
          )}
        </Step>
        <Step
          label={steps.series.label}
          description={formState.series?.name ?? steps.series.description}
          icon={steps.series.icon}
        >
          <SelectSeriesStep
            formState={formState}
            setFormState={setFormState}
            setError={setError}
            setIsLoading={setIsLoading}
            setCanProgress={setCanProgress}
          />
          {error && (
            <ul className="mb-4 list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              <li className="ml-4">{error}</li>
            </ul>
          )}
        </Step>
        <Step
          label={steps.flow.label}
          description={formState.flow?.name ?? steps.flow.description}
          icon={steps.flow.icon}
        >
          <SelectFlowStep
            formState={formState}
            setFormState={setFormState}
            setError={setError}
            setIsLoading={setIsLoading}
            setCanProgress={setCanProgress}
          />
          {error && (
            <ul className="mb-4 list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              <li className="ml-4">{error}</li>
            </ul>
          )}
        </Step>
        {/* <Step
          label={steps.metadata.label}
          description={formState.metadata ?? steps.metadata.description}
          icon={steps.metadata.icon}
        ></Step> */}
        <Footer
          canProgress={canProgress}
          formState={formState}
          onFinish={onFinish}
        />
      </Stepper>
    </div>
  );
}

function SelectedSeries({ seriesId }: { seriesId?: number }) {
  const seriesQuery = api.series.fetchFullSeriesData.useQuery(
    {
      seriesId: seriesId ?? 0,
    },
    {
      enabled: !!seriesId,
    },
  );

  if (seriesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  const series = seriesQuery.data;

  if (!series) {
    return <div>Series not found</div>;
  }

  return (
    <div className="flex flex-row flex-wrap gap-2 bg-card ">
      <div className="relative flex h-60 max-h-60 basis-full flex-row items-center gap-2 overflow-hidden rounded-md p-2 text-xs">
        <div className="relative h-full shrink-0 grow-0 basis-1/5">
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
                  className="absolute left-1 top-1 rounded-sm bg-card p-1 hover:bg-primary"
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
        <div className="flex h-full basis-4/5 flex-col overflow-hidden">
          <span className="line-clamp-1 font-semibold">{series.title}</span>
          <span className="author line-clamp-1 text-xs">{series.author}</span>
          <span className="line-clamp-1 py-3 text-xs">
            {series.genre?.slice(0, 4).map((genre) => {
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
          <span className="line-clamp-7 text-xs font-light">
            {series.description ?? "No Description"}
          </span>
        </div>
      </div>
      <div className="flex max-h-40 basis-full flex-col overflow-y-auto">
        <Table>
          <TableCaption>Chapters</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Page Count</TableHead>
              <TableHead>Scanlator</TableHead>
              <TableHead>Upload Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series.chapters.map((chapter) => {
              return (
                <TableRow key={chapter.id}>
                  <TableCell className="font-medium">
                    {chapter.chapterNumber}
                  </TableCell>
                  <TableCell>{chapter.name}</TableCell>
                  <TableCell>
                    {chapter.pageCount && chapter.pageCount > 0
                      ? `${chapter.pageCount} pages`
                      : "-"}
                  </TableCell>
                  <TableCell>{chapter.scanlator ?? "Unknown"}</TableCell>
                  <TableCell>
                    {chapter.uploadDate
                      ? new Date(chapter.uploadDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const Footer = ({
  canProgress,
  formState,
  onFinish,
}: {
  canProgress: boolean;
  formState: AddSeriesState;
  onFinish: () => void;
}) => {
  const {
    nextStep,
    prevStep,
    isDisabledStep,
    isError,
    isLoading,
    hasCompletedAllSteps,
    isLastStep,
  } = useStepper();

  const addSeries = api.series.addSeries.useMutation();
  const utils = api.useUtils();

  return (
    <>
      {hasCompletedAllSteps && (
        <div className="overflow flex items-center justify-start rounded-md border bg-secondary p-2">
          <SelectedSeries seriesId={formState.series?.id} />
        </div>
      )}
      <div className="flex w-full justify-end gap-2">
        <Button
          type="button"
          disabled={isDisabledStep}
          onClick={prevStep}
          size="sm"
          className="h-7 gap-1"
          variant="secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Back
          </span>
        </Button>
        {hasCompletedAllSteps ? (
          <Button
            type="button"
            size="sm"
            className="h-7 gap-1"
            disabled={
              canProgress === false || isLoading === true || isError === true
            }
            onClick={() => {
              addSeries.mutate(
                {
                  seriesId: formState.series?.id ?? 0,
                },
                {
                  onSuccess: () => {
                    utils.series.fetchLibrary.refetch().catch((e) => {
                      console.error(e);
                    });
                  },
                },
              );

              onFinish();
            }}
          >
            {isLoading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Finish
            </span>
          </Button>
        ) : (
          <Button
            type="button"
            disabled={
              canProgress === false || isLoading === true || isError === true
            }
            size="sm"
            className="h-7 gap-1"
            onClick={nextStep}
          >
            {isLoading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {isLastStep ? "Review" : "Next"}
            </span>
          </Button>
        )}
      </div>
    </>
  );
};
