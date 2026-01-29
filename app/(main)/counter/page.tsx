"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { api } from "@/lib/config/api";
import { useCashierUserContext } from "@/lib/cashier-user-context";
import type { Counter } from "@/types/backend";

export default function CounterPage() {
  const user = useCashierUserContext();
  const searchParams = useSearchParams();
  const counterId = searchParams.get("counterId") ?? "";

  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = user?.uid;
    if (!counterId || !uid) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.post<{ counters: Counter[] }>(
          "/counters/assigned",
          { uid },
        );
        const list = data?.counters ?? [];
        const assigned = list[0];
        if (!cancelled) {
          setCounter(assigned ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load counter");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [counterId, user?.uid]);

  // if (!counterId) {
  //   return (
  //     <div className="relative h-[calc(100dvh-96px)] w-full">
  //       <Dialog
  //         open
  //         onClose={() => {
  //           router.push("/landing");
  //         }}>
  //         <DialogPanel className="sm:max-w-md" showCloseButton>
  //           <DialogHeader>
  //             <DialogTitle className="flex items-center gap-2 text-destructive">
  //               <AlertTriangle className="size-5" />
  //               Access required
  //             </DialogTitle>
  //             <DialogDescription>
  //               You have to access the counter through a station.
  //             </DialogDescription>
  //           </DialogHeader>

  //           <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
  //             Open a station, select a counter, then you’ll be routed here.
  //           </div>

  //           <DialogFooter>
  //             <Button
  //               type="button"
  //               variant="destructive"
  //               onClick={() => {
  //                 router.push("/landing");
  //               }}>
  //               Go to stations
  //             </Button>
  //           </DialogFooter>
  //         </DialogPanel>
  //       </Dialog>
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading counter…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
        <p className="text-sm text-muted-foreground">
          No assigned counter found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {counter.number != null ? `Counter ${counter.number}` : "Counter"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {counter.stationId ? (
            <p className="text-sm text-muted-foreground">
              Station ID: {counter.stationId}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Counter ID: {counter.id ?? counterId}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
