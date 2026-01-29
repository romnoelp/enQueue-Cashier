"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/config/firebase";
import axios, { isAxiosError } from "axios";
import { Counter } from "@/types";

export type CashierUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  displayPicture: string | null;
  stationId: string | null;
  createdAt: string;
  updatedAt: string;
};

const NO_PROVIDER = Symbol("CashierUserContext.noProvider");

export const CashierUserContext = createContext<
  CashierUser | null | typeof NO_PROVIDER
>(NO_PROVIDER);

export function useCashierUserContext(): CashierUser | null {
  const ctx = useContext(CashierUserContext);
  if (ctx === NO_PROVIDER) {
    throw new Error(
      "useCashierUserContext must be used within a CashierUserContext.Provider",
    );
  }
  return ctx;
}

export function CashierUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cashierUser, setCashierUser] = useState<CashierUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user == null) {
        setCashierUser(null);
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL}/auth/cashier/me`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          },
        );
        const userBody = response.data?.user as CashierUser | undefined;
        if (userBody) {
          setCashierUser(userBody);

          let counter: Counter[] | null = null;
          if (userBody.stationId) {
            const counterRes = await axios.post(
              `${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL}/counters/assigned`,
              { uid: user.uid },
              { headers: { Authorization: `Bearer ${idToken}` } },
            );
            counter = counterRes.data?.counters ?? null;
          }

          if (pathname === "/") {
            router.replace(
              counter && counter?.length > 0
                ? `/counter?counterId=${counter[0].id}`
                : "/landing",
            );
          }
        }
      } catch (error) {
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            await signOut(auth);
            setCashierUser(null);
            router.replace("/");
          } else {
            console.error(
              "/auth/cashier/me error:",
              error.response?.data?.message,
            );
          }
        } else {
          console.error("/auth/cashier/me error:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <CashierUserContext.Provider value={cashierUser}>
      {children}
    </CashierUserContext.Provider>
  );
}
