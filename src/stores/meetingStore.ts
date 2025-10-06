import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Meeting, TranscriptSegment, ActionItem, RecordingState } from '@/types';

interface MeetingStore {
  currentMeeting: Meeting | null;
  recordingState: RecordingState;
  meetings: Meeting[];

  // Meeting actions
  startMeeting: (title?: string) => void;
  stopMeeting: () => void;
  pauseMeeting: () => void;
  resumeMeeting: () => void;

  // Transcript actions
  addTranscriptSegment: (segment: TranscriptSegment) => void;
  updateTranscriptSegment: (id: string, text: string) => void;

  // Action item actions
  addActionItem: (item: ActionItem) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  approveActionItem: (id: string) => void;

  // Meeting management
  saveMeeting: (meeting: Meeting) => void;
  loadMeeting: (id: string) => Meeting | null;
  deleteMeeting: (id: string) => void;
  updateDuration: () => void;
}

export const useMeetingStore = create<MeetingStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentMeeting: null,
        recordingState: {
          isRecording: false,
          isPaused: false,
          duration: 0
        },
        meetings: [],

        startMeeting: (title?: string) => {
          const timestamp = Date.now();
          const newMeeting: Meeting = {
            id: `meeting_${timestamp}`,
            title: title || `Meeting ${new Date(timestamp).toLocaleString()}`,
            startTime: timestamp,
            duration: 0,
            participants: [],
            transcript: [],
            actionItems: [],
            status: 'recording'
          };

          set({
            currentMeeting: newMeeting,
            recordingState: {
              isRecording: true,
              isPaused: false,
              duration: 0,
              startTime: timestamp
            }
          });
        },

        stopMeeting: () => {
          const { currentMeeting, meetings, recordingState } = get();
          if (!currentMeeting) return;

          const completedMeeting: Meeting = {
            ...currentMeeting,
            endTime: Date.now(),
            duration: recordingState.duration,
            status: 'completed'
          };

          set({
            currentMeeting: null,
            recordingState: {
              isRecording: false,
              isPaused: false,
              duration: 0
            },
            meetings: [completedMeeting, ...meetings]
          });
        },

        pauseMeeting: () => {
          set((state) => ({
            recordingState: {
              ...state.recordingState,
              isPaused: true
            }
          }));
        },

        resumeMeeting: () => {
          set((state) => ({
            recordingState: {
              ...state.recordingState,
              isPaused: false
            }
          }));
        },

        addTranscriptSegment: (segment) => {
          set((state) => {
            if (!state.currentMeeting) return state;

            return {
              currentMeeting: {
                ...state.currentMeeting,
                transcript: [...state.currentMeeting.transcript, segment]
              }
            };
          });
        },

        updateTranscriptSegment: (id, text) => {
          set((state) => {
            if (!state.currentMeeting) return state;

            return {
              currentMeeting: {
                ...state.currentMeeting,
                transcript: state.currentMeeting.transcript.map((segment) =>
                  segment.id === id ? { ...segment, text } : segment
                )
              }
            };
          });
        },

        addActionItem: (item) => {
          set((state) => {
            if (!state.currentMeeting) return state;

            return {
              currentMeeting: {
                ...state.currentMeeting,
                actionItems: [...state.currentMeeting.actionItems, item]
              }
            };
          });
        },

        updateActionItem: (id, updates) => {
          set((state) => {
            if (!state.currentMeeting) return state;

            return {
              currentMeeting: {
                ...state.currentMeeting,
                actionItems: state.currentMeeting.actionItems.map((item) =>
                  item.id === id ? { ...item, ...updates } : item
                )
              }
            };
          });
        },

        approveActionItem: (id) => {
          set((state) => {
            if (!state.currentMeeting) return state;

            return {
              currentMeeting: {
                ...state.currentMeeting,
                actionItems: state.currentMeeting.actionItems.map((item) =>
                  item.id === id ? { ...item, status: 'approved' as const } : item
                )
              }
            };
          });
        },

        saveMeeting: (meeting) => {
          set((state) => ({
            meetings: [meeting, ...state.meetings.filter((m) => m.id !== meeting.id)]
          }));
        },

        loadMeeting: (id) => {
          const { meetings } = get();
          return meetings.find((m) => m.id === id) || null;
        },

        deleteMeeting: (id) => {
          set((state) => ({
            meetings: state.meetings.filter((m) => m.id !== id)
          }));
        },

        updateDuration: () => {
          set((state) => {
            if (!state.recordingState.isRecording || state.recordingState.isPaused) {
              return state;
            }

            const now = Date.now();
            const startTime = state.recordingState.startTime || now;
            const duration = Math.floor((now - startTime) / 1000);

            return {
              recordingState: {
                ...state.recordingState,
                duration
              }
            };
          });
        }
      }),
      {
        name: 'fomo-meeting-store',
        partialize: (state) => ({
          meetings: state.meetings
        })
      }
    )
  )
);
