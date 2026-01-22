"use client";

import React from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const PendingPage = () => {
  return (
    <div className="flex min-h-[calc(100dvh-96px)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Spinner className="size-4" />
            Account pending approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your account isn’t approved yet. Please wait for an admin to approve
            your access. This page will automatically continue once you’re
            approved.
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.reload();
              }}>
              Refresh
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                await signOut({ redirectTo: "/" });
              }}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingPage;
