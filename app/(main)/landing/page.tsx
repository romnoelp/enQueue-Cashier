"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogPanel,
} from "@/components/animate-ui/components/headless/dialog";

import type { Station } from "@/types/station";
import type { Counter, CountersResponse } from "@/types/backend";

import { StationsHeader } from "@/app/(main)/landing/_components/stations-header";
import { StationsSummary } from "@/app/(main)/landing/_components/stations-summary";
import { StationsList } from "@/app/(main)/landing/_components/stations-list";
import { StationCountersDialog } from "@/app/(main)/landing/_components/station-counters-dialog";

const Landing = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isCountersOpen, setIsCountersOpen] = useState(false);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [countersError, setCountersError] = useState<string | null>(null);
  const [isCountersLoading, setIsCountersLoading] = useState(false);
  const [enteringCounterId, setEnteringCounterId] = useState<string | null>(
    null,
  );

  // const ensureIdToken = useCallback(async () => {

  //   if (auth.currentUser) {
  //     return await auth.currentUser.getIdToken();
  //   }

  //   const tokenRes = await fetch("/api/firebase/custom-token", {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //   });

  //   if (!tokenRes.ok) {
  //     const body = (await tokenRes.json().catch(() => null)) as {
  //       message?: string;
  //     } | null;
  //     throw new Error(body?.message ?? "Failed to get Firebase custom token");
  //   }

  //   const tokenBody = (await tokenRes.json()) as { customToken: string };
  //   const user = await signInToFirebaseWithCustomToken(
  //     auth,
  //     tokenBody.customToken,
  //   );
  //   return await user.getIdToken();
  // }, []);

  // const fetchStations = useCallback(async () => {
  //   const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  //   if (!baseUrl) {
  //     throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  //   }

  //   const idToken = await ensureIdToken();

  //   const res = await fetch(`${baseUrl}/stations?limit=50`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${idToken}`,
  //     },
  //   });

  //   if (!res.ok) {
  //     const body = (await res.json().catch(() => null)) as {
  //       message?: string;
  //     } | null;
  //     throw new Error(
  //       body?.message ?? `Failed to load stations (${res.status})`,
  //     );
  //   }

  //   const data = (await res.json()) as {
  //     stations: Array<{ id: string; name: string; description?: string }>;
  //     nextCursor: string | null;
  //   };

  //   // Backend stations currently don't include UI fields like status/avgWait.
  //   const mapped: Station[] = data.stations.map((s) => ({
  //     id: s.id,
  //     name: s.name,
  //     location: s.description,
  //     status: "Active",
  //     avgWaitMins: 0,
  //   }));

  //   setStations(mapped);
  //   setLastUpdatedAt(new Date());
  // }, [ensureIdToken]);

  // const fetchCountersForStation = useCallback(
  //   async (stationId: string) => {
  //     const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  //     if (!baseUrl) {
  //       throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  //     }

  //     const idToken = await ensureIdToken();
  //     const url = new URL(`${baseUrl}/counters`);
  //     url.searchParams.set("stationId", stationId);
  //     url.searchParams.set("limit", "50");

  //     const res = await fetch(url.toString(), {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${idToken}`,
  //       },
  //     });

  //     if (!res.ok) {
  //       const body = (await res.json().catch(() => null)) as {
  //         message?: string;
  //       } | null;
  //       throw new Error(
  //         body?.message ?? `Failed to load counters (${res.status})`,
  //       );
  //     }

  //     const data = (await res.json()) as CountersResponse;
  //     const filtered = (data.counters ?? []).filter(
  //       (c) => c.stationId === stationId,
  //     );
  //     setCounters(filtered);
  //   },
  //   [ensureIdToken],
  // );

  const openCountersForStation = useCallback(
    async (station: Station) => {
      setSelectedStation(station);
      setIsCountersOpen(true);
      setCounters([]);
      setCountersError(null);
      setIsCountersLoading(true);

      try {
        // Mock implementation - replace with actual API call later
        await new Promise(resolve => setTimeout(resolve, 500));
        setCounters([]);
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to load counters";
        setCountersError(message);
      } finally {
        setIsCountersLoading(false);
      }
    },
    [],
  );

  const enterCounter = useCallback(
    async (counterId: string) => {
      setEnteringCounterId(counterId);
      try {
        // Mock implementation - replace with actual API call later
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const params = new URLSearchParams();
        params.set("counterId", counterId);
        if (selectedStation?.id) params.set("stationId", selectedStation.id);
        if (selectedStation?.name) params.set("stationName", selectedStation.name);

        setIsCountersOpen(false);
        setSelectedStation(null);

        router.push(`/counter?${params.toString()}`);
      } finally {
        setEnteringCounterId(null);
      }
    },
    [router, selectedStation?.id, selectedStation?.name],
  );

  const refreshStations = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      // Mock implementation - replace with actual API call later
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdatedAt(new Date());
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to refresh stations";
      setLoadError(message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshStations();
  }, [refreshStations]);

  const filteredStations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter((s) => {
      const haystack =
        `${s.name} ${s.location ?? ""} ${s.status}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, stations]);

  const summary = useMemo(() => {
    const active = stations.filter((s) => s.status === "Active").length;
    const inactive = stations.filter((s) => s.status === "Inactive").length;
    const activeStations = stations.filter((s) => s.status === "Active");
    const avgWait =
      activeStations.length === 0
        ? 0
        : Math.round(
            activeStations.reduce((acc, s) => acc + s.avgWaitMins, 0) /
              activeStations.length,
          );
    return { active, inactive, avgWait };
  }, [stations]);

  return (
    <div className="h-[calc(100dvh-96px)] w-full overflow-hidden p-12">
      <div className="flex h-full min-h-0 w-full flex-col gap-6">
        <StationsHeader
          summary={summary}
          lastUpdatedAt={lastUpdatedAt}
          loadError={loadError}
          isRefreshing={isRefreshing}
          onRefresh={refreshStations}
        />

        <StationsSummary summary={summary} />

        <StationsList
          query={query}
          onQueryChange={setQuery}
          isRefreshing={isRefreshing}
          stations={stations}
          filteredStations={filteredStations}
          onOpenCounters={(station: Station) => {
            void openCountersForStation(station);
          }}
        />

        <Dialog
          open={isCountersOpen}
          onClose={() => {
            setIsCountersOpen(false);
            setSelectedStation(null);
          }}>
          <DialogPanel className="sm:max-w-2xl">
            <StationCountersDialog
              selectedStation={selectedStation}
              counters={counters}
              isLoading={isCountersLoading}
              error={countersError}
              enteringCounterId={enteringCounterId}
              onEnterCounter={(counterId) => void enterCounter(counterId)}
            />
          </DialogPanel>
        </Dialog>
      </div>
    </div>
  );
};

export default Landing;
