// JSON Viewer Pro — Options page script

document.addEventListener('DOMContentLoaded', () => {
  const enabledCheckbox = document.getElementById('enabled');
  const themeSelect = document.getElementById('theme');

  // Load current settings
  chrome.storage.sync.get('settings', (data) => {
    const settings = data.settings || { enabled: true, theme: 'auto' };
    enabledCheckbox.checked = settings.enabled;
    themeSelect.value = settings.theme || 'auto';
  });

  // Save settings
  document.getElementById('save').addEventListener('click', () => {
    const settings = {
      enabled: enabledCheckbox.checked,
      theme: themeSelect.value,
    };

    chrome.storage.sync.set({ settings }, () => {
      const status = document.getElementById('status');
      status.textContent = 'Saved!';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    });
  });
});
