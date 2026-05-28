import React, { createContext, useContext } from "react";

import type { DashboardData } from "@/hooks/useDashboard";

const DashboardContext = createContext<DashboardData | null>(null);

export const DashboardProvider: React.FC<{
  value: DashboardData;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <DashboardContext.Provider value={value}>
    {children}
  </DashboardContext.Provider>
);

export const useDashboardContext = (): DashboardData => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used within DashboardProvider");
  }
  return ctx;
};

