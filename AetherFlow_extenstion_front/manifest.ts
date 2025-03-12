import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json';

const { version } = packageJson;

// 将版本号转换为Chrome扩展格式
const [major, minor, patch] = version.split('.');
const versionFormatted = `${major}.${minor}.${patch}`;

export default defineManifest({
  manifest_version: 3,
  name: 'AetherFlow',
  description: '让AI潜能随需释放',
  version: versionFormatted,
  version_name: version,
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: {
      '16': 'public/icons/icon16.png',
      '32': 'public/icons/icon32.png',
      '48': 'public/icons/icon48.png',
      '128': 'public/icons/icon128.png',
    },
  },
  side_panel: {
    default_path: 'src/pages/panel/index.html',
  },
  options_page: 'src/pages/options/index.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['assets/*'],
      matches: ['<all_urls>'],
    },
  ],
  permissions: [
    'storage',
    'tabs',
    'activeTab',
    'scripting',
    'sidePanel',
  ],
  host_permissions: ['<all_urls>'],
  icons: {
    '16': 'public/icons/icon16.png',
    '32': 'public/icons/icon32.png',
    '48': 'public/icons/icon48.png',
    '128': 'public/icons/icon128.png',
  },
}); 