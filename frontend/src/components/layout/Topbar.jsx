import React from "react";
import { useAuth } from "../../context/AuthContext";
import { fmtDate } from "../../utils/helpers";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const today = fmtDate(new Date());

  return (
    <header className="h-16 border-b border-white/5 bg-surface-100/80 backdrop-blur-sm flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-10">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-gray-100 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
        <span className="text-xs text-gray-500 font-mono hidden sm:block">SYSTEM LIVE</span>
      </div>

      <div className="flex-1" />

      {/* Date */}
      <span className="text-xs text-gray-500 font-mono hidden md:block">{today}</span>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 hidden md:block" />

      {/* User chip */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center text-xs font-bold text-primary">
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-200 leading-none">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}