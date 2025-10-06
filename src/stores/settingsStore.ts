import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Settings, AudioSettings, AISettings, AppearanceSettings } from '@/types';

interface SettingsStore extends Settings {
  // Actions
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  updateAISettings: (settings: Partial<AISettings>) => void;
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => void;
  updateGitHubConnection: (connected: boolean, repository?: string) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  audio: {
    deviceId: 'default',
    deviceName: 'Default Microphone',
    quality: 'balanced',
    autoSaveInterval: 5
  },
  ai: {
    model: 'gpt-4-turbo',
    actionItemSensitivity: 0.7,
    summaryVerbosity: 'detailed',
    enableRealTimeProcessing: true
  },
  integrations: {
    github: {
      connected: false,
      labelTemplates: ['meeting-notes', 'action-item'],
      autoCreateIssues: false
    }
  },
  appearance: {
    theme: 'dark',
    accentColor: '#3b82f6',
    fontSize: 'medium'
  }
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        ...defaultSettings,

        updateAudioSettings: (settings) => {
          set((state) => ({
            audio: {
              ...state.audio,
              ...settings
            }
          }));
        },

        updateAISettings: (settings) => {
          set((state) => ({
            ai: {
              ...state.ai,
              ...settings
            }
          }));
        },

        updateAppearanceSettings: (settings) => {
          set((state) => ({
            appearance: {
              ...state.appearance,
              ...settings
            }
          }));
        },

        updateGitHubConnection: (connected, repository) => {
          set((state) => ({
            integrations: {
              ...state.integrations,
              github: {
                ...state.integrations.github!,
                connected,
                defaultRepository: repository || state.integrations.github?.defaultRepository
              }
            }
          }));
        },

        resetSettings: () => {
          set(defaultSettings);
        }
      }),
      {
        name: 'fomo-settings-store'
      }
    )
  )
);
