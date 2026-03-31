import React, { useEffect, useState } from 'react';
import { AgentIdentityCard } from './components/AgentIdentityCard';

function App() {
  const [hnsUrl, setHnsUrl] = useState('hns://mytradingagent.agent');

  useEffect(() => {
    // If opened by extension, url will be in query params
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      setHnsUrl(urlParam);
    }
  }, []);

  return (
    <AgentIdentityCard hnsUrl={hnsUrl} />
  );
}

export default App;
