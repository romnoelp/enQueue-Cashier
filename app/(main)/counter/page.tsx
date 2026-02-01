"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import {
  Dialog,
  DialogPanel,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/animate-ui/components/headless/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { api } from "@/lib/config/api";
import { db } from "@/lib/config/firebase";
import { useCashierUserContext } from "@/lib/cashier-user-context";
import type { Counter } from "@/types/backend";
import type { Station } from "@/types/station";
import type { Queue } from "@/types/queue";

export default function CounterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">Loading counter…</p>
        </div>
      }>
      <CounterPageInner />
    </Suspense>
  );
}

function CounterPageInner() {
  const user = useCashierUserContext();
  const searchParams = useSearchParams();
  const counterId = searchParams.get("counterId") ?? "";

  const [counter, setCounter] = useState<Counter | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQueueNumber, setCurrentQueueNumber] = useState<string | null>(
    null,
  );
  const [currentServingQueue, setCurrentServingQueue] = useState<Queue | null>(
    null,
  );
  const [isServing, setIsServing] = useState(false);
  const [waitingList, setWaitingList] = useState<Queue[]>([]);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");
  const didFetchCurrentServing = useRef(false);

  const stationId = counter?.stationId ?? station?.id;

  // Fetch current serving once (endpoint can return queue or null)
  useEffect(() => {
    if (!counterId || didFetchCurrentServing.current) return;
    didFetchCurrentServing.current = true;
    (async () => {
      try {
        const { data } = await api.get<{ currentServing: Queue | null }>(
          `/queues/counter/${counterId}/current-serving`,
        );
        const queue = data?.currentServing ?? null;
        if (queue) {
          setCurrentServingQueue(queue);
          setCurrentQueueNumber(queue.queueNumber);
          setIsServing(true);
        } else {
          setCurrentServingQueue(null);
          setCurrentQueueNumber(null);
          setIsServing(false);
        }
      } catch {
        // leave currentQueueNumber / isServing as-is on error
      }
    })();
  }, [counterId]);

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
        setStation(null);
        const { data } = await api.post<{ counters: Counter[] }>(
          "/counters/assigned",
          { uid },
        );
        const list = data?.counters ?? [];
        const assigned = list[0];
        if (cancelled) return;
        setCounter(assigned ?? null);
        const sid = assigned?.stationId;
        if (sid) {
          const stationRes = await api.get<{ station: Station }>(
            `/stations/${sid}`,
          );
          if (!cancelled) {
            setStation(stationRes.data.station ?? null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load counter",
          );
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

  // Listen to waiting queue for this station (real-time)
  useEffect(() => {
    if (!stationId) {
      setWaitingList([]);
      return;
    }
    const q = query(
      collection(db, "queue"),
      where("stationId", "==", stationId),
      where("status", "==", "waiting"),
      orderBy("position", "asc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Queue[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          console.log(d);
          return {
            id: doc.id,
            stationId: d.stationId ?? "",
            counterId: d.counterId,
            queueNumber: d.queueNumber ?? "",
            purpose: d.purpose ?? "payment",
            customerEmail: d.customerEmail ?? "",
            status: d.status ?? "waiting",
            position: d.position ?? 0,
            estimatedWaitTime: d.estimatedWaitTime,
            qrId: d.qrId,
          } as Queue;
        });
        setWaitingList(list);
      },
      (err) => {
        console.error("Queues snapshot error:", err);
        setWaitingList([]);
      },
    );
    return () => unsubscribe();
  }, [stationId]);

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

  const handleStartService = async () => {
    const firstInQueue = waitingList[0];
    if (!firstInQueue) return;
    try {
      await api.post(`/queues/${firstInQueue.id}/start-service`, {
        counterId,
      });
      setCurrentServingQueue(firstInQueue);
      setCurrentQueueNumber(firstInQueue.queueNumber);
      setIsServing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start service");
    }
  };

  const openCompleteDialog = () => setCompleteDialogOpen(true);

  const handleCompleteService = async () => {
    if (!currentServingQueue) return;
    try {
      await api.post(`/queues/${currentServingQueue.id}/complete`, {
        notes: completeNotes,
      });
      setCompleteDialogOpen(false);
      setCompleteNotes("");
      setCurrentServingQueue(null);
      setCurrentQueueNumber(null);
      setIsServing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete service",
      );
    }
  };

  const handleMarkNoShow = async () => {
    if (!currentServingQueue) return;
    try {
      await api.post(`/queues/${currentServingQueue.id}/mark-no-show`);
      setCurrentServingQueue(null);
      setCurrentQueueNumber(null);
      setIsServing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark no-show");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {counter.number != null ? `Counter ${counter.number}` : "Counter"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{station?.name}</p>
          <p className="text-sm text-muted-foreground">
            {station?.description}
          </p>
        </CardContent>
      </Card>

      {/* Waiting to be called (status=waiting) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Waiting to be called</CardTitle>
          <p className="text-sm text-muted-foreground">
            {waitingList.length === 0
              ? "No one waiting"
              : `${waitingList.length} in queue`}
          </p>
        </CardHeader>
        <CardContent>
          {waitingList.length > 0 ? (
            <ul className="space-y-1.5">
              {waitingList.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="font-mono font-medium">{q.queueNumber}</span>
                  <span className="text-muted-foreground">
                    Position {q.position}
                    {q.estimatedWaitTime != null &&
                      ` · ~${q.estimatedWaitTime} min`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No one in queue</p>
          )}
        </CardContent>
      </Card>

      {/* Cashier Serving UI */}
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-8 text-center">
            {currentQueueNumber ? (
              <>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Currently Serving
                </p>
                <p className="text-6xl font-bold text-primary">
                  {currentQueueNumber}
                </p>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">
                No customer in service
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isServing ? (
              <Button
                onClick={handleStartService}
                size="lg"
                className="min-w-[140px]">
                Start Service
              </Button>
            ) : (
              <>
                <Button
                  onClick={openCompleteDialog}
                  size="lg"
                  variant="default"
                  className="min-w-[140px]">
                  Complete Service
                </Button>
                <Button
                  onClick={handleMarkNoShow}
                  size="lg"
                  variant="destructive"
                  className="min-w-[140px]">
                  Mark No Show
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={completeDialogOpen}
        onClose={() => {
          setCompleteDialogOpen(false);
          setCompleteNotes("");
        }}>
        <DialogPanel className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label
              htmlFor="complete-notes"
              className="text-sm font-medium leading-none">
              Notes (optional)
            </label>
            <input
              id="complete-notes"
              type="text"
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="Add any notes…"
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCompleteDialogOpen(false);
                setCompleteNotes("");
              }}>
              Cancel
            </Button>
            <Button onClick={handleCompleteService}>Submit</Button>
          </DialogFooter>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
