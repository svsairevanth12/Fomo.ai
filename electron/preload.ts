import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },

  // Audio API
  audio: {
    getSources: () => ipcRenderer.invoke('get-system-audio-sources'),
    startCapture: (deviceId: string) => ipcRenderer.invoke('start-audio-capture', deviceId),
    stopCapture: () => ipcRenderer.invoke('stop-audio-capture')
  },

  // Platform info
  platform: process.platform,

  // Check if running in Electron
  isElectron: true
});

// TypeScript definitions for the exposed API
export interface ElectronAPI {
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };
  audio: {
    getSources: () => Promise<Array<{ id: string; name: string }>>;
    startCapture: (deviceId: string) => Promise<{ success: boolean }>;
    stopCapture: () => Promise<{ success: boolean }>;
  };
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
