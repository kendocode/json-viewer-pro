import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'JSON Viewer Pro',
    permissions: ['storage'],
    web_accessible_resources: [
      {
        resources: ['/viewer.css'],
        matches: ['<all_urls>'],
      },
    ],
  },
});
