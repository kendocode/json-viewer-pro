const enabledCheckbox = document.getElementById('enabled') as HTMLInputElement;
const themeSelect = document.getElementById('theme') as HTMLSelectElement;

// Load current settings
browser.storage.sync.get('settings').then((data) => {
  const settings = (data.settings as { enabled: boolean; theme: string }) || { enabled: true, theme: 'auto' };
  enabledCheckbox.checked = settings.enabled;
  themeSelect.value = settings.theme || 'auto';
});

document.getElementById('save')!.addEventListener('click', () => {
  const settings = {
    enabled: enabledCheckbox.checked,
    theme: themeSelect.value,
  };

  browser.storage.sync.set({ settings }).then(() => {
    const status = document.getElementById('status')!;
    status.textContent = 'Saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
});
