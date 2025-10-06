/**
 * IPC Service - Bridge between Electron main process and renderer
 */

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electron?.isElectron;

class IPCService {
  // ============ Window Controls ============
  async minimizeWindow(): Promise<void> {
    if (!isElectron) return;
    await window.electron.window.minimize();
  }

  async maximizeWindow(): Promise<void> {
    if (!isElectron) return;
    await window.electron.window.maximize();
  }

  async closeWindow(): Promise<void> {
    if (!isElectron) return;
    await window.electron.window.close();
  }

  // ============ Audio API ============
  async getAudioSources(): Promise<Array<{ id: string; name: string }>> {
    if (!isElectron) {
      // Return mock data for browser
      return [{ id: 'default', name: 'Default Microphone' }];
    }
    return await window.electron.audio.getSources();
  }

  async startAudioCapture(deviceId: string): Promise<{ success: boolean }> {
    if (!isElectron) {
      return { success: true };
    }
    return await window.electron.audio.startCapture(deviceId);
  }

  async stopAudioCapture(): Promise<{ success: boolean }> {
    if (!isElectron) {
      return { success: true };
    }
    return await window.electron.audio.stopCapture();
  }

  // ============ Platform Info ============
  getPlatform(): string {
    if (!isElectron) return 'web';
    return window.electron.platform;
  }

  isElectron(): boolean {
    return isElectron;
  }
}

export const ipc = new IPCService();
