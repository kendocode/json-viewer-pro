export default defineBackground(() => {
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      browser.storage.sync.set({
        settings: {
          enabled: true,
          theme: 'auto',
        },
      });
    }
  });
});
