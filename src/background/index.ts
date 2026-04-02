// Handle omnibox input (e.g., user types "hns myagent.agent")
chrome.omnibox.onInputEntered.addListener((text) => {
  const url = text.startsWith('hns://') ? text : `hns://${text}`;
  openHnsPage(url);
});

// Intercept search queries when user types hns:// directly into the address bar without the keyword
chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    if (details.frameId === 0) { // Main frame only
      const url = new URL(details.url);
      
      // Extract search query from common search engines
      const q = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('p');
      
      if (q && q.trim().startsWith('hns://')) {
        const hnsUrl = q.trim();
        const extensionUrl = chrome.runtime.getURL(`index.html?url=${encodeURIComponent(hnsUrl)}`);
        chrome.tabs.update(details.tabId, { url: extensionUrl });
      }
    }
  },
  {
    url: [
      { hostContains: 'google.' },
      { hostContains: 'duckduckgo.com' },
      { hostContains: 'bing.com' },
      { hostContains: 'search.yahoo.com' },
      { hostContains: 'ecosia.org' },
      { hostContains: 'brave.com' }
    ]
  }
);

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openHnsLink' && message.url) {
    openHnsPage(message.url);
    sendResponse({ success: true });
  }
});

function openHnsPage(url: string) {
  const extensionUrl = chrome.runtime.getURL(`index.html?url=${encodeURIComponent(url)}`);
  chrome.tabs.create({ url: extensionUrl });
}
