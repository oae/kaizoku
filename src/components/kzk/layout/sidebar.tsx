import { List, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MadeWithLove } from "@/components/kzk/layout/made-with-love";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const sidebarItems = [
  {
    name: "Users",
    href: "/users",
    target: "_self",
    icon: <Users className="h-5 w-5" />,
    topSide: true,
  },
  {
    name: "Queue",
    href: "/queue",
    target: "_self",
    icon: <List className="h-5 w-5" />,
    topSide: true,
  },
  {
    name: "Donate",
    target: "_blank",
    href: "https://github.com/sponsors/oae",
    icon: <MadeWithLove />,
    topSide: false,
  },
];

export default function KzkSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <AppIcon />
        {sidebarItems
          .filter((item) => item.topSide)
          .map((item, index) => {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    target={item.target}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  >
                    {item.icon}
                    <span className="sr-only">{item.name}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            );
          })}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        {sidebarItems
          .filter((item) => !item.topSide)
          .map((item, index) => {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    target={item.target}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  >
                    {item.icon}
                    <span className="sr-only">{item.name}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            );
          })}
      </nav>
    </aside>
  );
}

export function KzkNavbar() {
  return (
    <nav className="grid gap-6 text-lg font-medium">
      <AppIcon />
      {sidebarItems.map((item, index) => {
        return (
          <Link
            key={index}
            href={item.href}
            target={item.target}
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            {item.icon}
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function AppIcon() {
  return (
    <Link
      href="/"
      className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
    >
      <Image
        src="/kaizoku-logo.png"
        alt="Kaizoku logo"
        priority
        width={100}
        className="h-7 w-7 transition-all group-hover:scale-110"
        height={100}
      />
      <span className="sr-only">Kaizoku</span>
    </Link>
  );
}
