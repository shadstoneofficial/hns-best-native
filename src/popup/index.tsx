import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

function Popup() {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="text-cyan font-bold text-xl drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">hns://</div>
      <p className="text-sm text-center text-zinc-400">Native Protocol Handler is active.</p>
      <p className="text-xs text-center text-zinc-500 mt-2">
        Type <span className="text-zinc-300 font-mono bg-zinc-800 px-1 py-0.5 rounded">hns</span> + Space in your address bar to resolve Handshake agents.
      </p>
    </div>
  );
}

const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
