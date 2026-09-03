import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onHelpClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHelpClick }) => {
  return (
    <header className="group w-full max-w-[85rem] mx-auto mt-4 bg-white/90 backdrop-blur-xl border-4 border-white shadow-xl shadow-teal-500/10 hover:shadow-2xl hover:shadow-teal-500/20 hover:-translate-y-1 py-3 px-6 flex items-center justify-between sticky top-4 z-50 transition-all duration-300 rounded-[2rem]">
      <div className="flex items-center gap-4 cursor-pointer">
        <img 
          src="/logo.png" 
          alt="Aashna Logo" 
          className="h-16 w-auto object-contain transform transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 tracking-tight leading-none flex items-center gap-2">
            Aashna
            <Sparkles className="w-5 h-5 text-cyan-500 inline-block transform transition-transform group-hover:animate-pulse group-hover:rotate-12" />
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 hidden lg:block transition-colors group-hover:text-teal-500">
            Bridging Communication. Connecting Communities.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {onHelpClick && (
          <button
            onClick={onHelpClick}
            className="px-5 py-2.5 rounded-full bg-teal-50 border-2 border-teal-100 text-sm font-black text-teal-600 flex items-center gap-2 cursor-pointer hover:bg-teal-100 hover:border-teal-200 hover:text-teal-700 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 transition-all duration-300"
          >
            <HelpCircle className="w-4 h-4" /> App Tour
          </button>
        )}
        <button
          onClick={() => {
            import('../../lib/firebase').then(({ auth }) => {
              auth.signOut().then(() => {
                window.location.reload();
              });
            });
          }}
          className="px-5 py-2.5 rounded-full bg-rose-50 border-2 border-rose-100 text-sm font-black text-rose-500 flex items-center gap-2 cursor-pointer hover:bg-rose-100 hover:border-rose-200 hover:text-rose-600 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
