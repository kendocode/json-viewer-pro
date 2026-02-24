// JSON Viewer Pro — Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      settings: {
        enabled: true,
        theme: 'auto',
      },
    });
  }
});
