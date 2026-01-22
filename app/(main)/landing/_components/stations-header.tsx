"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RefreshCw } from "lucide-react";

type Summary = {
  active: number;
  inactive: number;
  avgWait: number;
};

type StationsHeaderProps = {
  summary: Summary;
  lastUpdatedAt: Date | null;
  loadError: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function StationsHeader({
  summary,
  lastUpdatedAt,
  loadError,
  isRefreshing,
  onRefresh,
}: StationsHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Stations</h1>
        <p className="text-sm text-muted-foreground">
          Monitor station availability and queue health at a glance.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Active: {summary.active}</Badge>
          <Badge variant="outline">Inactive: {summary.inactive}</Badge>
          {lastUpdatedAt ? (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdatedAt.toLocaleTimeString()}
            </span>
          ) : null}
          {loadError ? (
            <span className="text-xs text-destructive">{loadError}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={onRefresh}>
          {isRefreshing ? (
            <Spinner className="size-4" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {isRefreshing ? "Refreshing" : "Refresh"}
        </Button>
      </div>
    </header>
  );
}
