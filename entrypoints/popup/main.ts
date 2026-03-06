const enabledCheckbox = document.getElementById('enabled') as HTMLInputElement;
const themeSelect = document.getElementById('theme') as HTMLSelectElement;

// Load saved settings
browser.storage.sync.get('settings').then((data) => {
  const settings = (data.settings as { enabled: boolean; theme: string }) || { enabled: true, theme: 'auto' };
  enabledCheckbox.checked = settings.enabled;
  themeSelect.value = settings.theme || 'auto';
});

function saveSettings() {
  browser.storage.sync.set({
    settings: {
      enabled: enabledCheckbox.checked,
      theme: themeSelect.value,
    },
  });
}

enabledCheckbox.addEventListener('change', saveSettings);
themeSelect.addEventListener('change', saveSettings);

document.getElementById('options-link')!.addEventListener('click', (e) => {
  e.preventDefault();
  browser.runtime.openOptionsPage();
});
