import React from 'react';
import { ActiveView } from '../types';
import { Sparkles, Users, Plus } from 'lucide-react';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  collaboratorCount: number;
  onNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  collaboratorCount,
  onNewProject,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#070a11]/85 border-b border-white/10 px-6 backdrop-blur-md flex items-center justify-between gap-8">
      {/* Zone 1: Single element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('dashboard');
          }}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap hover:text-cyan-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
          <span>NeonStudio</span>
        </a>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">· AI Multimedia Suite</span>
      </div>

      {/* Zone 2: 4 clean single-line nav links */}
      <nav className="flex items-center gap-1 sm:gap-6 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`py-1 px-2.5 transition-colors whitespace-nowrap shrink-0 relative ${
            activeView === 'dashboard'
              ? 'text-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dashboard
          {activeView === 'dashboard' && (
            <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-cyan-400 shadow-[0_0_6px_rgba(0,242,254,0.8)]" />
          )}
        </button>

        <button
          onClick={() => setActiveView('canvas')}
          className={`py-1 px-2.5 transition-colors whitespace-nowrap shrink-0 relative ${
            activeView === 'canvas'
              ? 'text-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Canvas
          {activeView === 'canvas' && (
            <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-cyan-400 shadow-[0_0_6px_rgba(0,242,254,0.8)]" />
          )}
        </button>

        <button
          onClick={() => setActiveView('multimedia')}
          className={`py-1 px-2.5 transition-colors whitespace-nowrap shrink-0 relative ${
            activeView === 'multimedia'
              ? 'text-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Tools
          {activeView === 'multimedia' && (
            <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-cyan-400 shadow-[0_0_6px_rgba(0,242,254,0.8)]" />
          )}
        </button>

        <button
          onClick={() => setActiveView('templates')}
          className={`py-1 px-2.5 transition-colors whitespace-nowrap shrink-0 relative ${
            activeView === 'templates'
              ? 'text-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Templates
          {activeView === 'templates' && (
            <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-cyan-400 shadow-[0_0_6px_rgba(0,242,254,0.8)]" />
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>{collaboratorCount} Live</span>
        </div>
        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow-[0_0_12px_rgba(0,242,254,0.3)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>
    </header>
  );
};
