"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { forwardRef, useState } from "react";

import { AddSeriesSteps } from "@/components/kzk/series/add-series/steps";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

export const AddSeriesButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <Button size="sm" className="h-7 gap-1" ref={ref} {...props}>
        <PlusCircle className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Add Series
        </span>
      </Button>
    );
  },
);
AddSeriesButton.displayName = "AddSeriesButton";

export interface AddSeriesState {
  source?: {
    id: string;
    name: string;
  };
  series?: {
    id: number;
    name: string;
  };
  flow?: {
    id: string;
    name: string;
  };
  metadata?: string;
  interval?: string;
}
export function AddSeries() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <AddSeriesButton />
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[800px]"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add new series</DialogTitle>
            <DialogDescription>
              Add a new series to your library here.
            </DialogDescription>
          </DialogHeader>
          <AddSeriesSteps onFinish={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} noBodyStyles>
      <DrawerTrigger asChild>
        <AddSeriesButton />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add new series</DrawerTitle>
          <DrawerDescription>
            Add a new series to your library here.
          </DrawerDescription>
        </DrawerHeader>
        <div className="mb-4 px-4">
          <AddSeriesSteps onFinish={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
