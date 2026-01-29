"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
} from "@/components/animate-ui/components/headless/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { isAxiosError } from "axios";

import type { Station } from "@/types/station";
import type { Counter, CountersResponse } from "@/types/backend";

import { CounterList } from "@/app/(main)/landing/_components/counters";
import { StationCountersDialog } from "@/app/(main)/landing/_components/station-counters-dialog";
import { api } from "@/lib/config/api";
import { useCashierUserContext } from "@/lib/cashier-user-context";

const Landing = () => {
  const [query, setQuery] = useState("");
  const [counters, setCounters] = useState<Counter[]>([]);
  const [isCountersLoading, setIsCountersLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isCountersOpen, setIsCountersOpen] = useState(false);
  const [enteringCounterId, setEnteringCounterId] = useState<string | null>(
    null,
  );
  const [countersError, setCountersError] = useState<string | null>(null);
  const user = useCashierUserContext();
  const stationId = user?.stationId ?? null;
  console.log("stationId", stationId

  )

  useEffect(() => {
    const getCounters = async () => {
      if (!stationId) return;
      setIsCountersLoading(true);
      setCountersError(null);
      try {
        const { data } = await api.get<CountersResponse>(
          `/counters/${stationId}`,
        );
        setCounters(data.counters ?? []);
      } catch (err) {
        const message = isAxiosError(err)
          ? (err.response?.data?.message ??
            err.message ??
            "Failed to load counters")
          : "Failed to load counters";
        setCountersError(message);
      } finally {
        setIsCountersLoading(false);
      }
    };
    getCounters();
  }, [stationId]);

  const filteredCounters = useMemo(() => {
    const list = !query.trim()
      ? counters
      : (() => {
          const q = query.trim().toLowerCase();
          return counters.filter(
            (c) =>
              c.id?.toLowerCase().includes(q) ||
              String(c.number ?? "").includes(q),
          );
        })();
    return [...list].sort((a, b) => {
      const na = a.number ?? -Infinity;
      const nb = b.number ?? -Infinity;
      return nb - na;
    });
  }, [counters, query]);

  return (
    <div className="h-[calc(100dvh-96px)] w-full overflow-hidden p-12">
      <div className="flex h-full min-h-0 w-full flex-col gap-6">
        {/* <StationsHeader
          summary={summary}
          lastUpdatedAt={lastUpdatedAt}
          loadError={loadError}
          isRefreshing={isRefreshing}
          onRefresh={refreshStations}
        /> */}

        {/* <StationsSummary summary={summary} /> */}

        {user === null ? (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Counters</CardTitle>
              <CardDescription>.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="min-h-0 flex-1 pt-6">
              <ScrollArea className="h-full w-full">
                <div className="pr-4">
                  <div className="flex h-60 w-full items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Spinner className="size-4" />
                    Loading…
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : isCountersLoading && counters.length === 0 ? (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Counters</CardTitle>
              <CardDescription>.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="min-h-0 flex-1 pt-6">
              <ScrollArea className="h-full w-full">
                <div className="pr-4">
                  <div className="flex h-60 w-full items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Spinner className="size-4" />
                    Loading stations…
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <CounterList
            query={query}
            onQueryChange={setQuery}
            filteredCounters={filteredCounters}
            onOpenCounters={() => {}}
          />
        )}

        <Dialog
          open={isCountersOpen}
          onClose={() => {
            setIsCountersOpen(false);
          }}
        >
          <DialogPanel className="sm:max-w-2xl">
            <StationCountersDialog
              selectedStation={selectedStation}
              counters={counters}
              isLoading={isCountersLoading}
              error={countersError}
              enteringCounterId={enteringCounterId}
              onEnterCounter={(counterId) => setEnteringCounterId(counterId)}
            />
          </DialogPanel>
        </Dialog>
      </div>
    </div>
  );
};

export default Landing;
