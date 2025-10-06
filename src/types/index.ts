// ============ Meeting Types ============
export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: number;
  confidence: number;
  startTime: number; // seconds from meeting start
  endTime: number;
}

export interface Meeting {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  duration: number; // seconds
  participants: string[];
  transcript: TranscriptSegment[];
  actionItems: ActionItem[];
  summary?: MeetingSummary;
  status: 'recording' | 'processing' | 'completed' | 'failed';
}

// ============ Action Item Types ============
export type Priority = 'high' | 'medium' | 'low';
export type ActionItemStatus = 'pending' | 'creating' | 'created' | 'failed';

export interface ActionItem {
  id: string;
  text: string;
  assignee: string | null;
  context: string; // Surrounding conversation
  priority: Priority;
  status: ActionItemStatus;
  meetingId: string;
  timestamp: number;
  githubIssue?: {
    number: number;
    url: string;
    repository: string;
  };
}

// ============ Summary Types ============
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface MeetingSummary {
  id: string;
  meetingId: string;
  title: string;
  duration: number;
  participants: Participant[];
  keyDecisions: string[];
  blockers: string[];
  nextSteps: string[];
  sentiment: Sentiment;
  topics: string[];
  generatedAt: number;
}

export interface Participant {
  name: string;
  speakingTime: number; // seconds
  speakingPercentage: number;
}

// ============ GitHub Integration ============
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: 'open' | 'closed';
  assignee?: GitHubUser;
  labels: string[];
}

export interface GitHubAuth {
  token: string;
  user: GitHubUser;
  expiresAt?: number;
}

// ============ Settings Types ============
export interface AudioSettings {
  deviceId: string;
  deviceName: string;
  quality: 'high' | 'balanced' | 'fast';
  autoSaveInterval: number; // minutes
}

export interface AISettings {
  model: 'gpt-4' | 'gpt-4-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  actionItemSensitivity: number; // 0-1
  summaryVerbosity: 'brief' | 'detailed' | 'comprehensive';
  enableRealTimeProcessing: boolean;
}

export interface IntegrationSettings {
  github?: {
    connected: boolean;
    defaultRepository?: string;
    labelTemplates: string[];
    autoCreateIssues: boolean;
  };
  slack?: {
    connected: boolean;
    defaultChannel?: string;
  };
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface Settings {
  audio: AudioSettings;
  ai: AISettings;
  integrations: IntegrationSettings;
  appearance: AppearanceSettings;
}

// ============ API Response Types ============
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface WebSocketMessage {
  type: 'transcript' | 'action_item' | 'status' | 'error';
  data: any;
  timestamp: number;
}

// ============ UI Component Types ============
export type Route = 'live' | 'history' | 'settings' | 'integrations';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  startTime?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

// ============ Utility Types ============
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
