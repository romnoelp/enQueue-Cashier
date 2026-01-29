import React from "react";
import { MainDock } from "./_components/main-dock";
import { CashierUserProvider } from "@/lib/cashier-user-context";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CashierUserProvider>
      <div className="min-h-dvh pb-24">
        {children}
        <MainDock />
      </div>
    </CashierUserProvider>
  );
};

export default MainLayout;
