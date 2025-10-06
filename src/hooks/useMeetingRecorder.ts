import { useEffect, useCallback } from 'react';
import { useMeetingStore } from '@/stores/meetingStore';
import { api } from '@/services/api';
import { ipc } from '@/services/ipc';

export const useMeetingRecorder = () => {
  const {
    currentMeeting,
    recordingState,
    startMeeting,
    stopMeeting,
    pauseMeeting,
    resumeMeeting,
    updateDuration
  } = useMeetingStore();

  // Update duration every second when recording
  useEffect(() => {
    if (!recordingState.isRecording || recordingState.isPaused) return;

    const interval = setInterval(() => {
      updateDuration();
    }, 1000);

    return () => clearInterval(interval);
  }, [recordingState.isRecording, recordingState.isPaused, updateDuration]);

  const handleStart = useCallback(async () => {
    try {
      // Start local meeting
      startMeeting();

      // Start audio capture
      await ipc.startAudioCapture('default');

      // Notify backend
      await api.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      stopMeeting();
    }
  }, [startMeeting, stopMeeting]);

  const handleStop = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      // Stop audio capture
      await ipc.stopAudioCapture();

      // Notify backend
      await api.stopRecording(currentMeeting.id);

      // Stop local meeting
      stopMeeting();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [currentMeeting, stopMeeting]);

  const handlePause = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      pauseMeeting();
      await api.pauseRecording(currentMeeting.id);
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  }, [currentMeeting, pauseMeeting]);

  const handleResume = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      resumeMeeting();
      await api.resumeRecording(currentMeeting.id);
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  }, [currentMeeting, resumeMeeting]);

  return {
    currentMeeting,
    recordingState,
    start: handleStart,
    stop: handleStop,
    pause: handlePause,
    resume: handleResume
  };
};
