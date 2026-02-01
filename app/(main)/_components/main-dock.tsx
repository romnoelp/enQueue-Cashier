"use client";

import React from "react";
import Link from "next/link";
import { HomeIcon, LayoutGrid, LogOut, SettingsIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dock, DockIcon } from "@/components/ui/dock";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/config/firebase";
import { useRouter } from "next/navigation";
import { api } from "@/lib/config/api";
import { useCashierUserContext } from "@/lib/cashier-user-context";
import type { CountersResponse } from "@/types/backend";

const DATA = {
  navbar: [
    { href: "/landing", icon: HomeIcon, label: "Landing", isCounter: false },
    { href: `/counter`, icon: LayoutGrid, label: "Counter", isCounter: true },
    { href: "/settings", icon: SettingsIcon, label: "Settings", isCounter: false },
  ],
} as const;

export const MainDock = () => {
  const router = useRouter();
  const user = useCashierUserContext();

  const handleCounterClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const stationId = user?.stationId;
    const uid = user?.uid;
    
    if (!stationId || !uid) {
      router.push("/counter");
      return;
    }

    try {
      const { data } = await api.get<CountersResponse>(`/counters/${stationId}`);
      const counters = data.counters ?? [];
      
      // Find counter where cashierUid matches current user's uid
      const assignedCounter = counters.find(counter => counter.cashierUid === uid);
      
      if (assignedCounter?.id) {
        router.replace(`/counter?counterId=${assignedCounter.id}`);
      } else {
        router.push("/counter");
      }
    } catch (err) {
      console.error("Failed to fetch counters:", err);
      router.push("/counter");
    }
  };
  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <TooltipProvider>
        <Dock direction="middle" className="mt-0">
          {DATA.navbar.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {item.isCounter ? (
                    <button
                      onClick={handleCounterClick}
                      aria-label={item.label}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full",
                      )}>
                      <item.icon className="size-4" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full",
                      )}>
                      <item.icon className="size-4" />
                    </Link>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}

          <Separator orientation="vertical" className="mx-1 h-8" />

          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <AnimatedThemeToggler
                  aria-label="Toggle theme"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12 rounded-full [&>svg]:size-4",
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Theme</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>

          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Sign out"
                  onClick={async () => {
                    await signOut(auth);
                    router.replace("/")
                  }}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12 rounded-full",
                  )}>
                  <LogOut className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign out</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>
    </div>
  );
};
