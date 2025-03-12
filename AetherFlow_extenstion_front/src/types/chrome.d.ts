// Chrome API类型声明
declare namespace chrome {
  export namespace runtime {
    export function getURL(path: string): string;
    export function openOptionsPage(): void;
    export function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    export const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: any) => void): void;
      removeListener(callback: (message: any, sender: any, sendResponse: any) => void): void;
    };
    export const onInstalled: {
      addListener(callback: (details: any) => void): void;
      removeListener(callback: (details: any) => void): void;
    };
  }

  export namespace storage {
    export interface StorageChange {
      oldValue?: any;
      newValue?: any;
    }

    export interface StorageChanges {
      [key: string]: StorageChange;
    }

    export interface StorageArea {
      get(keys?: string | string[] | object | null): Promise<{ [key: string]: any }>;
      get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: object): Promise<void>;
      set(items: object, callback?: () => void): void;
      remove(keys: string | string[]): Promise<void>;
      remove(keys: string | string[], callback?: () => void): void;
      clear(): Promise<void>;
      clear(callback?: () => void): void;
    }

    export const local: StorageArea;
    export const sync: StorageArea;
    export const managed: StorageArea;
    export const session: StorageArea;

    export const onChanged: {
      addListener(callback: (changes: StorageChanges, areaName: string) => void): void;
      removeListener(callback: (changes: StorageChanges, areaName: string) => void): void;
    };
  }

  export namespace tabs {
    export interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active: boolean;
      windowId: number;
    }

    export function query(queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
      url?: string | string[];
    }, callback: (tabs: Tab[]) => void): void;

    export function create(createProperties: {
      url?: string;
      active?: boolean;
      windowId?: number;
    }): Promise<Tab>;
    export function create(
      createProperties: {
        url?: string;
        active?: boolean;
        windowId?: number;
      },
      callback?: (tab: Tab) => void
    ): void;

    export function sendMessage(tabId: number, message: any, responseCallback?: (response: any) => void): void;
  }

  export namespace sidePanel {
    export function open(): void;
    export function setPanelBehavior(options: { openPanelOnActionClick: boolean }): void;
  }
} 