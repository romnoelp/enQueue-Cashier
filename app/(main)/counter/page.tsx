"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Spinner } from "@/components/ui/spinner";

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
  const router = useRouter();
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
  const [markNoShowDialogOpen, setMarkNoShowDialogOpen] = useState(false);
  const [markNoShowReason, setMarkNoShowReason] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "start" | "complete" | "noShow" | "exit" | null
  >(null);
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
      setPendingAction("start");
      await api.post(`/queues/${firstInQueue.id}/start-service`, {
        counterId,
      });
      setCurrentServingQueue(firstInQueue);
      setCurrentQueueNumber(firstInQueue.queueNumber);
      setIsServing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start service");
    } finally {
      setPendingAction(null);
    }
  };

  const handleCompleteService = async () => {
    if (!currentServingQueue) return;
    try {
      setPendingAction("complete");
      await api.post(`/queues/${currentServingQueue.id}/complete`);
      setCurrentServingQueue(null);
      setCurrentQueueNumber(null);
      setIsServing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete service",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleMarkNoShow = async () => {
    if (!currentServingQueue) return;
    try {
      setPendingAction("noShow");
      await api.post(`/queues/${currentServingQueue.id}/mark-no-show`, {
        reason: markNoShowReason,
      });
      setMarkNoShowDialogOpen(false);
      setMarkNoShowReason("");
      setCurrentServingQueue(null);
      setCurrentQueueNumber(null);
      setIsServing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark no-show");
    } finally {
      setPendingAction(null);
    }
  };

  const handleExitCounter = async () => {
    if (!counterId) return;
    try {
      setPendingAction("exit");
      await api.post(`/counters/${counterId}/exit`);
      router.push("/landing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to exit counter");
    } finally {
      setPendingAction(null);
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
                disabled={pendingAction != null}
                size="lg"
                className="min-w-35">
                {pendingAction === "start" ? (
                  <span className="inline-flex items-center">
                    <Spinner className="mr-2" />
                    Starting…
                  </span>
                ) : (
                  "Start Service"
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCompleteService}
                  disabled={pendingAction != null}
                  size="lg"
                  variant="default"
                  className="min-w-35">
                  {pendingAction === "complete" ? (
                    <span className="inline-flex items-center">
                      <Spinner className="mr-2" />
                      Completing…
                    </span>
                  ) : (
                    "Complete Service"
                  )}
                </Button>
                <Button
                  onClick={() => setMarkNoShowDialogOpen(true)}
                  disabled={pendingAction != null}
                  size="lg"
                  variant="destructive"
                  className="min-w-35">
                  Mark No Show
                </Button>
              </>
            )}
          </div>
          <Button
            onClick={handleExitCounter}
            disabled={pendingAction != null}
            variant="outline"
            size="lg"
            className="mt-6 min-w-35">
            {pendingAction === "exit" ? (
              <span className="inline-flex items-center">
                <Spinner className="mr-2" />
                Exiting…
              </span>
            ) : (
              "Exit Counter"
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={markNoShowDialogOpen}
        onClose={() => {
          if (pendingAction === "noShow") return;
          setMarkNoShowDialogOpen(false);
          setMarkNoShowReason("");
        }}>
        <DialogPanel className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark No Show</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label
              htmlFor="mark-no-show-reason"
              className="text-sm font-medium leading-none">
              Reason (optional)
            </label>
            <input
              id="mark-no-show-reason"
              type="text"
              value={markNoShowReason}
              onChange={(e) => setMarkNoShowReason(e.target.value)}
              disabled={pendingAction === "noShow"}
              placeholder="Add reason…"
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              disabled={pendingAction === "noShow"}
              onClick={() => {
                if (pendingAction === "noShow") return;
                setMarkNoShowDialogOpen(false);
                setMarkNoShowReason("");
              }}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkNoShow}
              disabled={pendingAction === "noShow"}>
              {pendingAction === "noShow" ? (
                <span className="inline-flex items-center">
                  <Spinner className="mr-2" />
                  Submitting…
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
