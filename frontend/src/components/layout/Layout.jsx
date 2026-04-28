import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar  from "./Topbar";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main area — offset by sidebar width on lg+ */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[240px]">
        <Topbar onMenuClick={() => setCollapsed(!collapsed)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}