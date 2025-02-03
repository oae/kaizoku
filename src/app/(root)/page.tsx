import { ListFilter } from "lucide-react";

import { AddSeries } from "@/components/kzk/series/add-series";
import { ListSeries } from "@/components/kzk/series/list-series";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateRequest } from "@/lib/auth/validate-request";
import { SIGN_IN_URL } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { user } = await validateRequest();

  if (!user) redirect(SIGN_IN_URL);

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="archived" className="hidden sm:flex">
            Archived
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Provider A
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Provider B</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Provider C</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddSeries />
        </div>
      </div>
      <TabsContent value="all" className="flex flex-wrap gap-4 pt-4">
        <ListSeries />
      </TabsContent>
      <TabsContent value="active">active</TabsContent>
    </Tabs>
  );
}
