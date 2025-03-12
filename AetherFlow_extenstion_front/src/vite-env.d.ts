/// <reference types="vite/client" />

// 声明Chrome API类型
interface Window {
  chrome: {
    runtime: {
      getURL: (path: string) => string;
      onMessage: {
        addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
      };
      onInstalled: {
        addListener: (callback: (details: any) => void) => void;
      };
      openOptionsPage: () => void;
    };
    storage: {
      local: {
        get: (keys: string | string[] | object, callback: (items: any) => void) => void;
        set: (items: object, callback?: () => void) => void;
      };
    };
    tabs: {
      create: (options: { url: string }) => void;
    };
    sidePanel: {
      open: () => void;
      setPanelBehavior: (options: { openPanelOnActionClick: boolean }) => void;
    };
  };
} 