document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const link = target.closest('a');
  
  if (link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('hns://')) {
      event.preventDefault();
      chrome.runtime.sendMessage({
        action: 'openHnsLink',
        url: href
      });
    }
  }
});
