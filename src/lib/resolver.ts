const DOH_ENDPOINTS = [
  'https://hdns.io/dns-query',
  'https://dns.hnsd.io/dns-query'
];

interface DoHAnswer {
  name: string;
  type: number;
  data: string;
}

interface DoHResponse {
  Status: number;
  Answer?: DoHAnswer[];
}

export async function resolveHandshakeManifestUrl(domain: string): Promise<string | null> {
  // We specifically look for the TXT record on _agent.<domain>
  const targetDomain = `_agent.${domain}`;
  
  for (const endpoint of DOH_ENDPOINTS) {
    try {
      const url = new URL(endpoint);
      url.searchParams.append('name', targetDomain);
      url.searchParams.append('type', 'TXT');
      
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/dns-json'
        }
      });
      
      if (!response.ok) continue;
      
      const data: DoHResponse = await response.json();
      
      if (data.Status === 0 && data.Answer) {
        // Look for our specific TXT record prefix
        for (const record of data.Answer) {
          // DoH JSON format often wraps TXT data in quotes, e.g., '"agent-manifest=https://..."'
          const cleanData = record.data.replace(/^"|"$/g, '');
          
          if (cleanData.startsWith('agent-manifest=')) {
            const manifestUrl = cleanData.substring('agent-manifest='.length);
            return manifestUrl;
          }
        }
      }
    } catch (err) {
      console.warn(`DoH resolution failed for ${endpoint}:`, err);
      // Continue to next fallback endpoint
    }
  }
  
  return null;
}
