"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/animate-ui/components/headless/dialog";

export default function CounterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const counterId = searchParams.get("counterId")?.trim() ?? "";
  const counterNumber = searchParams.get("counterNumber")?.trim() ?? "";
  const stationName = searchParams.get("stationName")?.trim() ?? "";

  if (!counterId) {
    return (
      <div className="relative h-[calc(100dvh-96px)] w-full">
        <Dialog
          open
          onClose={() => {
            router.push("/landing");
          }}>
          <DialogPanel className="sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                Access required
              </DialogTitle>
              <DialogDescription>
                You have to access the counter through a station.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Open a station, select a counter, then you’ll be routed here.
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  router.push("/landing");
                }}>
                Go to stations
              </Button>
            </DialogFooter>
          </DialogPanel>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {counterNumber ? `Counter ${counterNumber}` : "Counter"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stationName ? (
            <p className="text-sm text-muted-foreground">
              Station: {stationName}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Counter ID: {counterId}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
