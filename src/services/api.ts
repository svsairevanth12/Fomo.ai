import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  APIResponse,
  Meeting,
  TranscriptSegment,
  ActionItem,
  MeetingSummary,
  Settings
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('github_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('github_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ Meeting Endpoints ============
  async startRecording(): Promise<APIResponse<{ meeting_id: string }>> {
    return this.client.post('/meeting/start');
  }

  async stopRecording(meetingId: string): Promise<APIResponse<void>> {
    return this.client.post(`/meeting/${meetingId}/stop`);
  }

  async pauseRecording(meetingId: string): Promise<APIResponse<void>> {
    return this.client.post(`/meeting/${meetingId}/pause`);
  }

  async resumeRecording(meetingId: string): Promise<APIResponse<void>> {
    return this.client.post(`/meeting/${meetingId}/resume`);
  }

  // ============ Transcript Endpoints ============
  async getTranscript(meetingId: string): Promise<APIResponse<TranscriptSegment[]>> {
    return this.client.get(`/meeting/${meetingId}/transcript`);
  }

  async updateTranscript(
    meetingId: string,
    segmentId: string,
    text: string
  ): Promise<APIResponse<void>> {
    return this.client.patch(`/meeting/${meetingId}/transcript/${segmentId}`, { text });
  }

  // Transcribe audio chunk (2-minute segments)
  async transcribeAudioChunk(formData: FormData): Promise<APIResponse<any>> {
    return this.client.post('/api/transcribe-chunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000 // 2 minutes timeout for transcription
    });
  }

  // ============ Action Items Endpoints ============
  async getActionItems(meetingId: string): Promise<APIResponse<ActionItem[]>> {
    return this.client.get(`/meeting/${meetingId}/actions`);
  }

  async createActionItem(
    meetingId: string,
    actionItem: Omit<ActionItem, 'id'>
  ): Promise<APIResponse<ActionItem>> {
    return this.client.post(`/meeting/${meetingId}/actions`, actionItem);
  }

  async updateActionItem(
    meetingId: string,
    actionItemId: string,
    updates: Partial<ActionItem>
  ): Promise<APIResponse<ActionItem>> {
    return this.client.patch(`/meeting/${meetingId}/actions/${actionItemId}`, updates);
  }

  // ============ Summary Endpoints ============
  async generateSummary(meetingId: string): Promise<APIResponse<MeetingSummary>> {
    return this.client.post(`/meeting/${meetingId}/summary`);
  }

  async getSummary(meetingId: string): Promise<APIResponse<MeetingSummary>> {
    return this.client.get(`/meeting/${meetingId}/summary`);
  }

  // Generate comprehensive meeting summary with action items (called at meeting end)
  async generateMeetingSummary(meetingId: string): Promise<APIResponse<any>> {
    return this.client.post(`/api/meetings/${meetingId}/analyze`, {
      timeout: 60000 // 1 minute timeout for AI analysis
    });
  }

  // ============ Meeting Management ============
  async createMeeting(data: { id: string; title: string }): Promise<APIResponse<Meeting>> {
    return this.client.post('/api/meetings', data);
  }

  async getMeeting(meetingId: string): Promise<APIResponse<Meeting>> {
    return this.client.get(`/api/meetings/${meetingId}`);
  }

  async getAllMeetings(limit = 50, offset = 0): Promise<APIResponse<Meeting[]>> {
    return this.client.get('/api/meetings', { params: { limit, offset } });
  }

  async deleteMeeting(meetingId: string): Promise<APIResponse<void>> {
    return this.client.delete(`/meeting/${meetingId}`);
  }

  // ============ Settings Endpoints ============
  async getSettings(): Promise<APIResponse<Settings>> {
    return this.client.get('/settings');
  }

  async updateSettings(settings: Partial<Settings>): Promise<APIResponse<Settings>> {
    return this.client.put('/settings', settings);
  }

  // ============ Health Check ============
  async healthCheck(): Promise<APIResponse<{ status: string; version: string }>> {
    return this.client.get('/health');
  }
}

// Create singleton instance
export const api = new APIService();
