/**
 * Audio Recording Service - DEPRECATED
 *
 * This file is deprecated. Audio capture is now handled by the Python backend.
 * The frontend only triggers recording via API calls.
 *
 * See: backend/audio_capture.py for the new implementation
 */

// DEPRECATED: Browser-based audio capture removed
// Audio capture is now handled by Python backend service

export interface AudioChunk {
  id: string;
  meetingId: string;
  blob: Blob;
  timestamp: number;
  duration: number;
  chunkIndex: number;
}

export interface RecordingConfig {
  chunkDuration: number; // milliseconds (default: 2 minutes)
  mimeType: string;
  audioBitsPerSecond: number;
}

const DEFAULT_CONFIG: RecordingConfig = {
  chunkDuration: 2 * 60 * 1000, // 2 minutes
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000 // 128 kbps
};

class AudioRecorderService {
  // DEPRECATED: All methods now use Python backend

  /**
   * Start recording - DEPRECATED
   * Now triggers Python backend audio capture
   */
  async startRecording(
    meetingId: string,
    onChunkReady?: (chunk: AudioChunk) => void
  ): Promise<void> {
    console.warn('[AudioRecorder] DEPRECATED: Browser-based audio capture removed');
    console.warn('[AudioRecorder] Use Python backend API: POST /api/audio/start');
    throw new Error('Browser-based audio capture is deprecated. Use Python backend API.');

      // Check if audio track is available
      const audioTracks = this.audioStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track available');
      }

      this.currentMeetingId = meetingId;
      this.chunkIndex = 0;
      this.recordingStartTime = Date.now();
      this.onChunkReady = onChunkReady || null;

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.config.mimeType,
        audioBitsPerSecond: this.config.audioBitsPerSecond
      });

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.handleChunk(event.data);
        }
      };

      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      // Start recording with time slicing (2-minute chunks)
      this.mediaRecorder.start();

      // Set up chunk timer
      this.startChunkTimer();

      console.log('Audio recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<AudioChunk[]> {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Stop the recorder
      this.mediaRecorder.stop();

      // Clear chunk timer
      if (this.chunkTimer) {
        clearInterval(this.chunkTimer);
        this.chunkTimer = null;
      }

      // Stop all audio tracks
      if (this.audioStream) {
        this.audioStream.getTracks().forEach((track) => track.stop());
        this.audioStream = null;
      }

      console.log('Audio recording stopped');
    }

    const recordedChunks = [...this.chunks];
    this.chunks = [];
    this.currentMeetingId = null;
    this.chunkIndex = 0;

    return recordedChunks;
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      if (this.chunkTimer) {
        clearInterval(this.chunkTimer);
        this.chunkTimer = null;
      }
      console.log('Recording paused');
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.startChunkTimer();
      console.log('Recording resumed');
    }
  }

  /**
   * Start chunk timer to create chunks every 2 minutes
   */
  private startChunkTimer(): void {
    this.chunkTimer = setInterval(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        // Request data from recorder
        this.mediaRecorder.requestData();
      }
    }, this.config.chunkDuration);
  }

  /**
   * Handle audio chunk
   */
  private handleChunk(blob: Blob): void {
    if (!this.currentMeetingId) return;

    const chunk: AudioChunk = {
      id: `chunk_${this.currentMeetingId}_${this.chunkIndex}`,
      meetingId: this.currentMeetingId,
      blob,
      timestamp: Date.now(),
      duration: this.config.chunkDuration,
      chunkIndex: this.chunkIndex
    };

    this.chunks.push(chunk);
    this.chunkIndex++;

    console.log(`Audio chunk ${chunk.chunkIndex} ready (${(blob.size / 1024).toFixed(2)} KB)`);

    // Notify callback
    if (this.onChunkReady) {
      this.onChunkReady(chunk);
    }
  }

  /**
   * Get all recorded chunks
   */
  getChunks(): AudioChunk[] {
    return [...this.chunks];
  }

  /**
   * Get recording state
   */
  getState(): string {
    return this.mediaRecorder?.state || 'inactive';
  }

  /**
   * Check if browser supports audio recording
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia &&
      window.MediaRecorder
    );
  }

  /**
   * Get supported MIME types
   */
  static getSupportedMimeTypes(): string[] {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];

    return types.filter((type) => MediaRecorder.isTypeSupported(type));
  }

  /**
   * Save chunk to IndexedDB for persistence
   */
  async saveChunkToStorage(chunk: AudioChunk): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['audioChunks'], 'readwrite');
      const store = transaction.objectStore('audioChunks');

      await store.put({
        id: chunk.id,
        meetingId: chunk.meetingId,
        blob: chunk.blob,
        timestamp: chunk.timestamp,
        duration: chunk.duration,
        chunkIndex: chunk.chunkIndex
      });

      console.log(`Chunk ${chunk.id} saved to IndexedDB`);
    } catch (error) {
      console.error('Failed to save chunk to storage:', error);
    }
  }

  /**
   * Load chunks from IndexedDB
   */
  async loadChunksFromStorage(meetingId: string): Promise<AudioChunk[]> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['audioChunks'], 'readonly');
      const store = transaction.objectStore('audioChunks');
      const index = store.index('meetingId');

      const request = index.getAll(meetingId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to load chunks from storage:', error);
      return [];
    }
  }

  /**
   * Open IndexedDB database
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FOMOAudioDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('audioChunks')) {
          const store = db.createObjectStore('audioChunks', { keyPath: 'id' });
          store.createIndex('meetingId', 'meetingId', { unique: false });
        }
      };
    });
  }

  /**
   * Clear all chunks for a meeting from storage
   */
  async clearMeetingChunks(meetingId: string): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['audioChunks'], 'readwrite');
      const store = transaction.objectStore('audioChunks');
      const index = store.index('meetingId');

      const request = index.openCursor(meetingId);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      console.log(`Cleared chunks for meeting ${meetingId}`);
    } catch (error) {
      console.error('Failed to clear chunks:', error);
    }
  }
}

// Export singleton instance
export const audioRecorder = new AudioRecorderService();

