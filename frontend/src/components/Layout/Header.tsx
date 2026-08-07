import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
          S
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
          Sign Language Bridge
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 uppercase tracking-wider">
          EN
        </div>
      </div>
    </header>
  );
};
