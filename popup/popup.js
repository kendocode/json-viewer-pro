// JSON Viewer Pro — Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const enabledCheckbox = document.getElementById('enabled');
  const themeSelect = document.getElementById('theme');

  // Load saved settings
  chrome.storage.sync.get('settings', (data) => {
    const settings = data.settings || { enabled: true, theme: 'auto' };
    enabledCheckbox.checked = settings.enabled;
    themeSelect.value = settings.theme || 'auto';
  });

  // Save on change
  enabledCheckbox.addEventListener('change', saveSettings);
  themeSelect.addEventListener('change', saveSettings);

  function saveSettings() {
    chrome.storage.sync.set({
      settings: {
        enabled: enabledCheckbox.checked,
        theme: themeSelect.value,
      },
    });
  }

  // Open options page
  document.getElementById('options-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
