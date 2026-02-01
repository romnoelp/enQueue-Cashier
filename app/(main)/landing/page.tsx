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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import type { Counter, CountersResponse } from "@/types/backend";

import { CounterList } from "@/app/(main)/landing/_components/counters";
import { api } from "@/lib/config/api";
import { useCashierUserContext } from "@/lib/cashier-user-context";
import { useRouter } from "next/navigation";

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

function canEnterCounter(
  counter: Counter,
  userUid: string | undefined,
): boolean {
  if (!isOccupied(counter)) return true;
  return isOwnCounter(counter, userUid);
}

const Landing = () => {
  const [query, setQuery] = useState("");
  const [counters, setCounters] = useState<Counter[]>([]);
  const [isCountersLoading, setIsCountersLoading] = useState(false);
  const [isCountersOpen, setIsCountersOpen] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const user = useCashierUserContext();
  const stationId = user?.stationId ?? null;

  const router = useRouter();



  useEffect(() => {
    const getCounters = async () => {
      if (!stationId) return;
      setIsCountersLoading(true);
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
        toast.error(message);
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
              String(c.number ?? "").includes(q),
          );
        })();
    return [...list].sort((a, b) => {
      const na = a.number ?? -Infinity;
      const nb = b.number ?? -Infinity;
      return nb - na;
    });
  }, [counters, query]);

  const handleCounterClick = (counter: Counter) => {
    setSelectedCounter(counter);
    setIsCountersOpen(true);
  };

  const handleEnterCounter = async () => {
    const counterId = selectedCounter?.id;
    if (!counterId) return;
    setIsEntering(true);
    try {
      await api.post(`/counters/${counterId}/enter`);
      setIsCountersOpen(false);
      setSelectedCounter(null);
      const { data } = await api.get<CountersResponse>(`/counters/${stationId}`);
      setCounters(data.counters ?? []);
      const stationIdParam = selectedCounter?.stationId ?? "";
      const counterNumberParam =
        selectedCounter?.number != null ? String(selectedCounter.number) : "";
      router.replace(
        `/counter?stationId=${stationIdParam}&counterNumber=${counterNumberParam}`,
      );
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data?.message ?? err.message ?? "Failed to enter counter")
        : "Failed to enter counter";
      toast.error(message);
    } finally {
      setIsEntering(false);
    }
  };

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
              <CardDescription></CardDescription>
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
              <CardDescription></CardDescription>
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
            onCounterClick={handleCounterClick}
            currentUserUid={user?.uid}
          />
        )}

        <Dialog
          open={isCountersOpen}
          onClose={() => {
            setIsCountersOpen(false);
            setSelectedCounter(null);
          }}
        >
          <DialogPanel className="sm:max-w-md">
            {selectedCounter && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Counter {selectedCounter.number ?? selectedCounter.id}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Status:{" "}
                    <Badge
                      variant={isOccupied(selectedCounter) ? "secondary" : "outline"}
                      className={
                        isOwnCounter(selectedCounter, user?.uid)
                          ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                          : isOccupied(selectedCounter)
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      }
                    >
                      {isOwnCounter(selectedCounter, user?.uid)
                        ? "Your counter"
                        : isOccupied(selectedCounter)
                          ? "Occupied"
                          : "Open"}
                    </Badge>
                  </p>
                </div>
                <Button
                  onClick={handleEnterCounter}
                  disabled={isEntering || !canEnterCounter(selectedCounter, user?.uid)}
                  className="text-white"
                >
                  {isEntering ? "Entering…" : "Enter"}
                </Button>
              </div>
            )}
          </DialogPanel>
        </Dialog>
      </div>
    </div>
  );
};

export default Landing;
