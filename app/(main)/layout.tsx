import React from "react";
import { MainDock } from "./_components/main-dock";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-dvh pb-24">
      {children}
      <MainDock />
    </div>
  );
};

export default MainLayout;
