import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { ipc } from '@/services/ipc';

export const Titlebar: React.FC = () => {
  const handleMinimize = () => ipc.minimizeWindow();
  const handleMaximize = () => ipc.maximizeWindow();
  const handleClose = () => ipc.closeWindow();

  return (
    <div className="h-10 bg-black border-b-2 border-white/10 flex items-center justify-between px-4 drag-region">
      {/* App title with logo */}
      <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
        <img src="/logo-small.svg" alt="FOMO" className="w-6 h-6" />
        <span>FOMO</span>
      </div>

      {/* Window controls */}
      <div className="flex items-center gap-1 no-drag-region">
        <button
          onClick={handleMinimize}
          className="w-10 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-10 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Maximize"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="w-10 h-8 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
