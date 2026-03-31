import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Server, Globe } from 'lucide-react';
import '../index.css';

type ResolutionMode = 'gateway' | 'decentralized';

function Popup() {
  const [mode, setMode] = useState<ResolutionMode>('gateway');

  useEffect(() => {
    // Load saved preference
    chrome.storage.local.get(['resolutionMode'], (result) => {
      if (result.resolutionMode) {
        setMode(result.resolutionMode as ResolutionMode);
      }
    });
  }, []);

  const handleModeChange = (newMode: ResolutionMode) => {
    setMode(newMode);
    chrome.storage.local.set({ resolutionMode: newMode });
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-cyan font-bold text-xl drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">hns://</div>
      <p className="text-sm text-center text-zinc-400">Native Protocol Handler is active.</p>
      
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 mt-2">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Resolver Mode</h3>
        
        <div className="flex flex-col space-y-2">
          <label className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${mode === 'gateway' ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800/50 border border-transparent'}`}>
            <input 
              type="radio" 
              name="mode" 
              value="gateway" 
              checked={mode === 'gateway'} 
              onChange={() => handleModeChange('gateway')}
              className="accent-cyan w-4 h-4"
            />
            <Server className={`w-4 h-4 ${mode === 'gateway' ? 'text-cyan' : 'text-zinc-500'}`} />
            <span className={`text-sm ${mode === 'gateway' ? 'text-zinc-200' : 'text-zinc-500'}`}>Gateway (Default)</span>
          </label>

          <label className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${mode === 'decentralized' ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800/50 border border-transparent'}`}>
            <input 
              type="radio" 
              name="mode" 
              value="decentralized" 
              checked={mode === 'decentralized'} 
              onChange={() => handleModeChange('decentralized')}
              className="accent-magenta w-4 h-4"
            />
            <Globe className={`w-4 h-4 ${mode === 'decentralized' ? 'text-magenta' : 'text-zinc-500'}`} />
            <span className={`text-sm ${mode === 'decentralized' ? 'text-zinc-200' : 'text-zinc-500'}`}>Decentralized Resolver</span>
          </label>
        </div>
      </div>

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
