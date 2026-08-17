import React from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-teal-200 selection:text-teal-900">
      <Header />
      <main className="flex-1 w-full max-w-[90rem] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
        {children}
      </main>
    </div>
  );
};
