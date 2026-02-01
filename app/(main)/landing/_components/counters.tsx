"use client";

import React from "react";
import { AnimatedList } from "@/components/ui/animated-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

import type { Counter } from "@/types/backend";
import type { Station } from "@/types/station";

function isOccupied(counter: Counter): boolean {
  return counter.cashierUid != null && counter.cashierUid !== "";
}

function isOwnCounter(counter: Counter, userUid: string | undefined): boolean {
  return (
    userUid != null &&
    counter.cashierUid != null &&
    counter.cashierUid !== "" &&
    counter.cashierUid === userUid
  );
}

type CounterListProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filteredCounters: Counter[];
  onOpenCounters: (station: Station) => void;
  onCounterClick?: (counter: Counter) => void;
  currentUserUid?: string;
};

export function CounterList({
  query,
  onQueryChange,
  filteredCounters,
  onCounterClick,
  currentUserUid,
}: CounterListProps) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Counters</CardTitle>
            <CardDescription>.</CardDescription>
          </div>

          <div className="relative w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search counters"
              className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="min-h-0 flex-1 pt-6">
        <ScrollArea className="h-full w-full">
          <div className="pr-4">
            <AnimatedList className="w-full items-stretch">
              {filteredCounters.map((counter) => {
                const occupied = isOccupied(counter);
                const own = isOwnCounter(counter, currentUserUid);
                return (
                  <div key={counter.id}>
                    <Card
                      className="cursor-pointer py-4 shadow-sm transition-colors hover:bg-muted/50"
                      onClick={() => onCounterClick?.(counter)}
                    >
                      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold tabular-nums">
                              {counter.number ?? "—"}
                            </span>
                            <span className="text-muted-foreground">
                              Counter {counter.number}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={occupied ? "secondary" : "outline"}
                          className={
                            own
                              ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                              : occupied
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          }
                        >
                          {own ? "Your counter" : occupied ? "Occupied" : "Open"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </AnimatedList>

            {filteredCounters.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm font-medium">No counters found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search term.
                </p>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
