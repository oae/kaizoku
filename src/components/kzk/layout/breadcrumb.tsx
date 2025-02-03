"use client";

import { sidebarItems } from "@/components/kzk/layout/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export default function KzkBreadcrumb() {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            {paths === "/" ? (
              <BreadcrumbPage className="flex items-center gap-1">
                <Home className="h-5 w-5" /> Home
              </BreadcrumbPage>
            ) : (
              <Link href="/" className="flex items-center gap-1">
                <Home className="h-5 w-5" /> Home
              </Link>
            )}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathNames.map((link, index) => {
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;
          const itemLink = link[0]!.toUpperCase() + link.slice(1, link.length);
          const icon = sidebarItems.find((item) => item.href === href)?.icon;
          return (
            <Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  {paths === href ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      {icon}
                      {itemLink}
                    </BreadcrumbPage>
                  ) : (
                    <Link href={href} className="flex items-center gap-1">
                      {icon}
                      {itemLink}
                    </Link>
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
