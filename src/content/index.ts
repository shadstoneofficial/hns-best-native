document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const link = target.closest('a');
  
  if (link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('hns://')) {
      // Prevent default behavior which causes the "unknown protocol" error
      event.preventDefault();
      event.stopPropagation();
      
      chrome.runtime.sendMessage({
        action: 'openHnsLink',
        url: href
      });
    }
  }
}, true); // Use capture phase to ensure we catch it before other handlers
