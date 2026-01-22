import React from "react";
import { MainDock } from "./_components/main-dock";
import { AuthGate } from "./_components/auth-gate";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-dvh pb-24">
      <AuthGate />
      {children}
      <MainDock />
    </div>
  );
};

export default MainLayout;
