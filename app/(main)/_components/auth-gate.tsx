"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getFirebaseAuth,
  signInToFirebaseWithCustomToken,
} from "@/lib/firebase/client";

const ALLOWED_ROLES = new Set(["cashier", "admin", "superAdmin"]);
const PENDING_PATH = "/pending";
const DEFAULT_AFTER_APPROVAL_PATH = "/landing";

export const AuthGate = () => {
  const router = useRouter();
  const pathname = usePathname();
  const inFlightRef = useRef<Promise<void> | null>(null);

  const ensureIdToken = useCallback(async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    const forceRefresh = pathname === PENDING_PATH;

    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(forceRefresh);
    }

    const tokenRes = await fetch("/api/firebase/custom-token", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!tokenRes.ok) {
      // Not signed in or not allowed domain.
      router.replace("/");
      return null;
    }

    const tokenBody = (await tokenRes.json()) as { customToken: string };
    const user = await signInToFirebaseWithCustomToken(
      auth,
      tokenBody.customToken,
    );
    return await user.getIdToken(true);
  }, [pathname, router]);

  const checkAndRoute = useCallback(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_API_BASE_URL");
      return;
    }

    const idToken = await ensureIdToken();
    if (!idToken) return;

    const res = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      // If the backend rejects, treat as not approved.
      if (pathname !== PENDING_PATH) {
        router.replace(PENDING_PATH);
      }
      return;
    }

    const body = (await res.json()) as {
      user?: { role?: string | null };
    };

    const role = body?.user?.role ?? null;
    const isAllowed = role !== null && ALLOWED_ROLES.has(role);

    if (!isAllowed) {
      if (pathname !== PENDING_PATH) {
        router.replace(PENDING_PATH);
      }
      return;
    }

    // Approved: keep user out of /pending.
    if (pathname === PENDING_PATH) {
      router.replace(DEFAULT_AFTER_APPROVAL_PATH);
    }
  }, [ensureIdToken, pathname, router]);

  const runCheck = useCallback(() => {
    if (!inFlightRef.current) {
      inFlightRef.current = (async () => {
        try {
          await checkAndRoute();
        } finally {
          inFlightRef.current = null;
        }
      })();
    }
  }, [checkAndRoute]);

  useEffect(() => {
    runCheck();
  }, [runCheck, pathname]);

  useEffect(() => {
    if (pathname !== PENDING_PATH) return;
    const id = window.setInterval(() => {
      runCheck();
    }, 10_000);
    return () => window.clearInterval(id);
  }, [pathname, runCheck]);

  return null;
};
