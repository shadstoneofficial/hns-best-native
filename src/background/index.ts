// Handle omnibox input (e.g., user types "hns myagent.agent")
chrome.omnibox.onInputEntered.addListener((text) => {
  const url = text.startsWith('hns://') ? text : `hns://${text}`;
  openHnsPage(url);
});

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
