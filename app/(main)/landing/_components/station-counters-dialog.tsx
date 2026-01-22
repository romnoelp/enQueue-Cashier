"use client";

import React from "react";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/headless/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

import type { Station } from "@/types/station";
import type { Counter } from "@/types/backend";

type StationCountersDialogProps = {
  selectedStation: Station | null;
  counters: Counter[];
  isLoading: boolean;
  error: string | null;
  enteringCounterId: string | null;
  onEnterCounter: (counterId: string) => void;
};

export function StationCountersDialog({
  selectedStation,
  counters,
  isLoading,
  error,
  enteringCounterId,
  onEnterCounter,
}: StationCountersDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Station Counters</DialogTitle>
        <DialogDescription>
          {selectedStation
            ? `Manage counters for ${selectedStation.name}.`
            : "Manage counters for this station."}
        </DialogDescription>
      </DialogHeader>

      <div className="relative grid min-h-65 gap-3">
        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/70 backdrop-blur-sm">
            <Spinner className="size-6" />
          </div>
        ) : null}

        {!isLoading && !error && counters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No counters found.</p>
        ) : null}

        {!isLoading && counters.length > 0 ? (
          <div className="grid gap-2">
            {counters
              .slice()
              .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
              .map((counter) => {
                const counterId = counter.id ?? "";
                const isOccupied = Boolean(counter.cashierUid);
                const isEntering = enteringCounterId === counterId;
                const occupant = counter.cashierUid ?? null;

                return (
                  <Button
                    key={counterId || String(counter.number ?? Math.random())}
                    type="button"
                    variant="outline"
                    className="h-auto justify-between gap-3 py-3"
                    disabled={!counterId || isOccupied || isEntering}
                    onClick={() => {
                      if (!counterId) return;
                      onEnterCounter(counterId);
                    }}>
                    <span className="flex min-w-0 flex-col items-start">
                      <span className="font-medium">
                        Counter {counter.number ?? "—"}
                      </span>
                      <span className="mt-0.5 truncate text-xs text-muted-foreground">
                        {isOccupied
                          ? `Occupied by: ${occupant ?? "Unknown"}`
                          : "Unoccupied"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {isEntering ? <Spinner className="size-4" /> : null}
                      {isOccupied ? (
                        <Badge variant="secondary">Occupied</Badge>
                      ) : (
                        <Badge variant="outline">Available</Badge>
                      )}
                    </span>
                  </Button>
                );
              })}
          </div>
        ) : null}
      </div>

      <DialogFooter>
        <DialogClose as={Button} variant="outline">
          Close
        </DialogClose>
      </DialogFooter>
    </>
  );
}
