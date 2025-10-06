/**
 * Python Audio Capture API Service
 * Communicates with Python backend for audio capture
 */

const API_BASE_URL = 'http://localhost:5000';

export interface AudioStatus {
  is_recording: boolean;
  meeting_id: string | null;
  current_chunk: number;
  chunk_duration: number;
}

export interface AudioDevice {
  id: number;
  name: string;
  type: 'input' | 'output';
  is_loopback: boolean;
}

export interface AudioTestResult {
  success: boolean;
  device?: string;
  duration?: number;
  audio_level?: number;
  has_audio?: boolean;
  error?: string;
}

export class PythonAudioAPI {
  /**
   * Start audio capture on Python backend
   */
  static async startCapture(meetingId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PythonAudioAPI] Error starting capture:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Stop audio capture on Python backend
   */
  static async stopCapture(): Promise<{ success: boolean; meeting_id?: string; total_chunks?: number; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PythonAudioAPI] Error stopping capture:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get current audio capture status
   */
  static async getStatus(): Promise<{ success: boolean; data?: AudioStatus; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/status`, {
        method: 'GET',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PythonAudioAPI] Error getting status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List available audio devices
   */
  static async listDevices(): Promise<{ success: boolean; data?: AudioDevice[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/devices`, {
        method: 'GET',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PythonAudioAPI] Error listing devices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test audio capture
   */
  static async testCapture(duration: number = 5): Promise<AudioTestResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PythonAudioAPI] Error testing capture:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Poll for transcript updates
   */
  static async pollTranscript(meetingId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
        method: 'GET',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PythonAudioAPI] Error polling transcript:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Start polling for transcript updates
   * Returns a function to stop polling
   */
  static startPolling(
    meetingId: string,
    onUpdate: (transcript: any) => void,
    interval: number = 5000
  ): () => void {
    let isPolling = true;

    const poll = async () => {
      while (isPolling) {
        try {
          const result = await this.pollTranscript(meetingId);
          if (result.success && result.data) {
            onUpdate(result.data);
          }
        } catch (error) {
          console.error('[PythonAudioAPI] Polling error:', error);
        }

        // Wait for interval
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
    };
  }
}

