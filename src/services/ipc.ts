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

  // Audio capture is now handled by audioRecorder service
  // These methods are kept for backward compatibility but are no longer used
  async startAudioCapture(deviceId: string): Promise<{ success: boolean }> {
    console.log('Audio capture now handled by audioRecorder service');
    return { success: true };
  }

  async stopAudioCapture(): Promise<{ success: boolean }> {
    console.log('Audio capture now handled by audioRecorder service');
    return { success: true };
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
