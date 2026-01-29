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
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Search, Users } from "lucide-react";

import type { Station, StationStatus } from "@/types/station";
import { Counter } from "@/types";

function statusBadgeVariant(status: StationStatus) {
  switch (status) {
    case "Active":
      return "secondary";
    case "Inactive":
      return "outline";
    default:
      return "default";
  }
}

function statusDotClass(status: StationStatus) {
  switch (status) {
    case "Active":
      return "bg-emerald-500";
    case "Inactive":
      return "bg-muted-foreground/40";
    default:
      return "bg-muted-foreground/40";
  }
}

type CounterListProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filteredCounters: Counter[];
  onOpenCounters: (station: Station) => void;
};

export function CounterList({
  query,
  onQueryChange,
  filteredCounters,
  onOpenCounters,
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
              placeholder="Search stations…"
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
              {filteredCounters.map((counter) => (
                <div key={counter.id}>
                  <Card className="py-4 shadow-sm">
                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 shrink-0 rounded-full ${statusDotClass(
                              counter.status,
                            )}`}
                            aria-hidden="true"
                          />
                          <p className="truncate font-medium">{counter.name}</p>
                          <Badge variant={statusBadgeVariant(counter.status)}>
                            {counter.status}
                          </Badge>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {station.location ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" />
                              {station.location}
                            </span>
                          ) : null}

                          <span className="inline-flex items-center gap-1">
                            <Users className="size-3" />
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />~{station.avgWaitMins}m
                            avg wait
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <LiquidButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={station.status === "Inactive"}
                          onClick={() => {}}>
                          Details
                        </LiquidButton>

                        <LiquidButton
                          type="button"
                          variant="default"
                          size="sm"
                          disabled={station.status === "Inactive"}
                          onClick={() => onOpenCounters(station)}>
                          Counters
                        </LiquidButton>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
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
