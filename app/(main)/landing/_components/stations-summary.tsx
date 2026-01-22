"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";

type Summary = {
  active: number;
  inactive: number;
  avgWait: number;
};

type StationsSummaryProps = {
  summary: Summary;
};

export function StationsSummary({ summary }: StationsSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="py-4">
        <CardContent className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-semibold">{summary.active}</p>
          </div>
          <div className="rounded-lg border bg-background p-2 text-muted-foreground">
            <Users className="size-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-xl font-semibold">{summary.inactive}</p>
          </div>
          <div className="rounded-lg border bg-background p-2 text-muted-foreground">
            <Users className="size-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Avg Wait</p>
            <p className="text-xl font-semibold">{summary.avgWait}m</p>
          </div>
          <div className="rounded-lg border bg-background p-2 text-muted-foreground">
            <Clock className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
