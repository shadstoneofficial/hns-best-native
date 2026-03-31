import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, Copy, Check, Zap, Cpu, Code, AlertTriangle, Server, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { resolveHandshakeManifestUrl } from '../lib/resolver';

interface AgentIdentityCardProps {
  hnsUrl: string;
}

interface AgentManifest {
  name: string;
  version: string;
  description: string;
  identity?: string;
  squad?: string;
  capabilities?: string[];
  webhook?: string;
  did?: string;
  trust?: string[];
  uptime?: string;
  payment_endpoints?: {
    lightning?: string;
    tempo_mpp?: string;
  };
}

const GATEWAY_URL = 'https://headlessdomains.com';

export function AgentIdentityCard({ hnsUrl }: AgentIdentityCardProps) {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedDid, setCopiedDid] = useState(false);
  const [showFullSkill, setShowFullSkill] = useState(false);

  const [agentData, setAgentData] = useState<AgentManifest | null>(null);
  const [skillContent, setSkillContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolutionMode, setResolutionMode] = useState<'gateway' | 'decentralized'>('gateway');

  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  const cleanName = hnsUrl.replace('hns://', '').replace(/\/$/, '');

  useEffect(() => {
    async function resolveAgent() {
      if (!cleanName) return;
      
      setLoading(true);
      setError(null);
      setFallbackTriggered(false);
      
      try {
        // 1. Determine which mode the user selected
        const storageResult = await chrome.storage.local.get(['resolutionMode']);
        const mode = storageResult.resolutionMode || 'gateway';
        setResolutionMode(mode as 'gateway' | 'decentralized');

        if (mode === 'decentralized') {
          // --- DIRECT RESOLUTION MODE ---
          try {
            const manifestUrl = await resolveHandshakeManifestUrl(cleanName);
            
            if (!manifestUrl) {
              throw new Error(`No agent-manifest TXT record found on Handshake for _agent.${cleanName}`);
            }

            // Fetch the raw JSON from the decentralized pointer with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const manifestRes = await fetch(manifestUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!manifestRes.ok) {
              throw new Error(`Failed to fetch manifest from ${manifestUrl}`);
            }

            const rawManifest = await manifestRes.json();
            setAgentData(rawManifest);
            setSkillContent('SKILL.md fetching in decentralized mode is under construction.');
          } catch (directErr) {
            console.warn('Decentralized resolution failed, falling back to gateway:', directErr);
            setFallbackTriggered(true);
            setResolutionMode('gateway');
            // Auto-switch storage back to gateway for future requests to prevent repeated slow failures
            chrome.storage.local.set({ resolutionMode: 'gateway' });
            
            // Proceed to execute gateway logic below
            throw new Error('TRIGGER_FALLBACK');
          }
        } 
        
        if (mode === 'gateway' || fallbackTriggered) {
          // --- GATEWAY RESOLUTION MODE ---
          const [manifestRes, skillRes] = await Promise.all([
            fetch(`${GATEWAY_URL}/manifests/${cleanName}.json`),
            fetch(`${GATEWAY_URL}/skills/${cleanName}.md`)
          ]);

          if (!manifestRes.ok) {
            throw new Error(`Agent manifest not found (Status: ${manifestRes.status})`);
          }

          const manifest = await manifestRes.json();
          setAgentData(manifest);

          if (skillRes.ok) {
            const text = await skillRes.text();
            setSkillContent(text);
          } else {
            setSkillContent('No SKILL.md found for this agent.');
          }
        }
        
      } catch (err) {
        if (err instanceof Error && err.message === 'TRIGGER_FALLBACK') {
          // Now execute the gateway fallback logic
          try {
            const [manifestRes, skillRes] = await Promise.all([
              fetch(`${GATEWAY_URL}/manifests/${cleanName}.json`),
              fetch(`${GATEWAY_URL}/skills/${cleanName}.md`)
            ]);

            if (!manifestRes.ok) {
              throw new Error(`Agent manifest not found (Status: ${manifestRes.status})`);
            }

            const manifest = await manifestRes.json();
            setAgentData(manifest);

            if (skillRes.ok) {
              const text = await skillRes.text();
              setSkillContent(text);
            } else {
              setSkillContent('No SKILL.md found for this agent.');
            }
          } catch (gatewayErr) {
            console.error('Fallback gateway resolution also failed:', gatewayErr);
            setError(gatewayErr instanceof Error ? gatewayErr.message : 'Unknown resolution error');
          }
        } else {
          console.error('Error resolving hns:// agent:', err);
          setError(err instanceof Error ? err.message : 'Unknown resolution error');
        }
      } finally {
        setLoading(false);
      }
    }

    resolveAgent();
  }, [cleanName]);

  const handleCopy = (text: string, type: 'webhook' | 'did') => {
    navigator.clipboard.writeText(text);
    if (type === 'webhook') {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } else if (type === 'did') {
      setCopiedDid(true);
      setTimeout(() => setCopiedDid(false), 2000);
    }
  };

  const handlePayment = (endpoint: string, type: 'lightning' | 'tempo') => {
    if (type === 'lightning') {
      // In a real implementation, this might trigger a WebLN provider (like Alby)
      // or open a lightning: URI. For now, we mock an invoice trigger.
      window.open(`lightning:${endpoint}`, '_self');
      alert(`Triggering Lightning payment to: ${endpoint}`);
    } else if (type === 'tempo') {
      // Mocking a Tempo MPP flow
      alert(`Initiating Tempo MPP flow with endpoint: ${endpoint}`);
    }
  };

  const handleOpenHttps = () => {
    window.open(`https://${cleanName}.hns.to`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-zinc-300 font-sans p-4 md:p-8 flex flex-col items-center justify-center">
        <Cpu className="w-12 h-12 text-cyan animate-pulse mb-6 drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" />
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Resolving Agent</h2>
        <p className="font-mono text-zinc-400 text-sm">hns://{cleanName}</p>
      </div>
    );
  }

  if (error || !agentData) {
    const isNotFound = error?.includes('404') || error?.includes('not found');
    
    return (
      <div className="min-h-screen bg-background text-zinc-300 font-sans p-4 md:p-8 flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-magenta mb-6 drop-shadow-[0_0_8px_rgba(255,0,170,0.5)]" />
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Resolution Failed</h2>
        
        {isNotFound ? (
          <div className="text-center max-w-md mb-8">
            <p className="font-mono text-zinc-400 text-sm mb-4">Agent manifest not found for <span className="text-cyan">hns://{cleanName}</span></p>
            <p className="text-zinc-500 text-sm mb-6">This agent hasn't registered its manifest on the gateway yet, or the domain doesn't exist.</p>
            <button 
              onClick={() => window.open('https://headlessdomains.com', '_blank')}
              className="w-full flex justify-center items-center space-x-2 bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/30 px-6 py-3 rounded-lg transition-colors shadow-[0_0_10px_rgba(0,243,255,0.1)] hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]"
            >
              <span>Register on HeadlessDomains</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="font-mono text-zinc-400 text-sm mb-8">{error || 'Unknown error'}</p>
        )}

        <button 
          onClick={handleOpenHttps}
          className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-6 py-3 rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600"
        >
          <span>Try Gateway Fallback (hns.to)</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const previewLength = 300;
  const skillPreview = skillContent.length > previewLength 
    ? skillContent.slice(0, previewLength) + '...' 
    : skillContent;

  return (
    <div className="min-h-screen bg-background text-zinc-300 font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Top Bar */}
      {fallbackTriggered && (
        <div className="w-full max-w-4xl bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-3 rounded-xl mb-4 flex items-center text-sm shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Decentralized resolution failed or timed out. Automatically fell back to reliable Gateway mode.</span>
        </div>
      )}
      <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-8 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-zinc-400 mb-4 md:mb-0">
          <Code className="w-5 h-5 text-cyan" />
          <span className="font-mono text-sm tracking-wide">{hnsUrl}</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Verified {resolutionMode === 'decentralized' ? 'via Decentralized' : 'via Gateway'}
          </span>
        </div>
        <button 
          onClick={handleOpenHttps}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600 text-sm"
        >
          <span>Open in HTTPS</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* 1. Header */}
        <div className="p-8 border-b border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan via-magenta to-cyan opacity-75"></div>
          <h1 className="text-4xl font-bold text-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.5)] mb-3">
            {agentData.name || cleanName} <span className="text-zinc-500 text-2xl font-light">{agentData.version || 'v1.0.0'}</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-4">{agentData.description || 'Autonomous Agent'}</p>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-zinc-500">Identity:</span>
            <span className="text-zinc-200 font-medium">{agentData.identity || 'Unknown'}</span>
            {agentData.squad && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">Squad:</span>
                <span className="text-cyan font-mono bg-cyan/10 px-2 py-0.5 rounded">{agentData.squad}</span>
              </>
            )}
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 2. Capabilities */}
            {agentData.capabilities && agentData.capabilities.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-magenta" />
                  Capabilities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {agentData.capabilities.map(cap => (
                    <span 
                      key={cap} 
                      className="px-3 py-1 text-sm font-mono text-cyan border border-cyan/30 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.1)] bg-cyan/5"
                    >
                      [{cap}]
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 3. SKILL.md */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2 text-zinc-400" />
                SKILL.md
              </h2>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 font-sans text-sm leading-relaxed text-zinc-300 relative overflow-hidden">
                <div className={`prose prose-invert prose-sm max-w-none prose-a:text-cyan prose-a:no-underline hover:prose-a:underline prose-code:text-magenta ${!showFullSkill && skillContent.length > previewLength ? 'max-h-64' : ''}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {DOMPurify.sanitize(skillContent)}
                  </ReactMarkdown>
                </div>
                {!showFullSkill && skillContent.length > previewLength && (
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none rounded-b-xl"></div>
                )}
              </div>
              {skillContent.length > previewLength && (
                <button 
                  onClick={() => setShowFullSkill(!showFullSkill)}
                  className="mt-3 text-sm text-cyan hover:text-cyan/80 transition-colors focus:outline-none"
                >
                  {showFullSkill ? '[ Show Less ]' : '[ Read Full SKILL.md ]'}
                </button>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* 4. Connection & Payment */}
            <section className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Connection</h2>
              
              <div className="space-y-4">
                {agentData.webhook && (
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Webhook</label>
                    <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-2 group hover:border-zinc-500 transition-colors">
                      <span className="font-mono text-xs text-zinc-300 truncate flex-1">{agentData.webhook}</span>
                      <button 
                        onClick={() => handleCopy(agentData.webhook!, 'webhook')}
                        className="ml-2 text-zinc-400 hover:text-zinc-200 p-1"
                        title="Copy Webhook"
                      >
                        {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {agentData.did && (
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">DID</label>
                    <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-2 group hover:border-zinc-500 transition-colors">
                      <span className="font-mono text-xs text-zinc-300 truncate flex-1">{agentData.did}</span>
                      <button 
                        onClick={() => handleCopy(agentData.did!, 'did')}
                        className="ml-2 text-zinc-400 hover:text-zinc-200 p-1"
                        title="Copy DID"
                      >
                        {copiedDid ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                
                {!agentData.webhook && !agentData.did && (
                  <p className="text-sm text-zinc-500 italic">No connection details provided.</p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Payment Protocols</h3>
                <div className="space-y-3">
                  {agentData.payment_endpoints?.lightning && (
                    <button 
                      onClick={() => handlePayment(agentData.payment_endpoints!.lightning!, 'lightning')}
                      className="w-full flex items-center justify-center space-x-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 py-2.5 rounded-lg transition-colors font-medium text-sm group"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Pay via Lightning</span>
                    </button>
                  )}
                  {agentData.payment_endpoints?.tempo_mpp && (
                    <button 
                      onClick={() => handlePayment(agentData.payment_endpoints!.tempo_mpp!, 'tempo')}
                      className="w-full flex items-center justify-center space-x-2 bg-magenta/10 hover:bg-magenta/20 text-magenta border border-magenta/30 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-[0_0_15px_rgba(255,0,170,0.1)] hover:shadow-[0_0_20px_rgba(255,0,170,0.2)] group"
                    >
                      <Code className="w-4 h-4" />
                      <span>Pay via Tempo MPP</span>
                    </button>
                  )}
                  {(!agentData.payment_endpoints || (!agentData.payment_endpoints.lightning && !agentData.payment_endpoints.tempo_mpp)) && (
                    <p className="text-sm text-zinc-500 italic">No payment endpoints provided.</p>
                  )}
                </div>
              </div>
            </section>

            {/* 5. Trust & Metadata */}
            <section className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Metadata</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-zinc-500">Trust</span>
                  <span className="text-zinc-300 font-medium">
                    {agentData.trust ? agentData.trust.join(', ') : 'Unknown'}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-zinc-500">Uptime</span>
                  <span className="text-emerald-400 font-medium">{agentData.uptime || 'N/A'}</span>
                </li>
              </ul>
              <div className="mt-5 pt-5 border-t border-zinc-800">
                <a href={`${GATEWAY_URL}/manifests/${cleanName}.json`} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-cyan transition-colors flex items-center">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  View raw agent.json
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-zinc-500 text-sm">
        <p>Resolved via <span className="font-mono text-cyan">hns://</span> • Powered by Handshake</p>
      </footer>
    </div>
  );
}
