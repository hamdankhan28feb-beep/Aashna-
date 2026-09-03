import React from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  /** Opens the guided tour — provided only when the user is authenticated. */
  onHelpClick?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onHelpClick }) => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-teal-200 selection:text-teal-900">
      <Header onHelpClick={onHelpClick} />
      <main className="flex-1 w-full max-w-[90rem] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
        {children}
      </main>

      {/* Global Creator Footer */}
      <footer className="w-full pb-8 pt-4 mt-auto text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-slate-800 font-bold text-sm">
            Created with 💜 for the Deaf & Hard of Hearing Community
          </p>
          
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 text-xs font-black uppercase tracking-wider text-slate-800">
            {/* Ayesha Nehal */}
            <div className="flex items-center gap-3 bg-white/40 px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              <span className="text-black">Ayesha Nehal</span>
              <span className="text-slate-400">|</span>
              <a href="https://www.linkedin.com/in/ayesha-nehal-446586294/" target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">LinkedIn</a>
              <span>•</span>
              <a href="https://github.com/AyeshaNehal" target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">GitHub</a>
              <span>•</span>
              <a href="mailto:ayeshanehal54321@gmail.com" className="hover:text-violet-600 transition-colors">Email</a>
            </div>

            {/* M. Hamdan Khan */}
            <div className="flex items-center gap-3 bg-white/40 px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              <span className="text-black">Muhammad Hamdan</span>
              <span className="text-slate-400">|</span>
              <a href="https://www.linkedin.com/in/muhammad-hamdan-473061392/" target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">LinkedIn</a>
              <span>•</span>
              <a href="https://github.com/hamdankhan28feb-beep" target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">GitHub</a>
              <span>•</span>
              <a href="mailto:hamdankhan28feb@gmail.com" className="hover:text-violet-600 transition-colors">Email</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};
