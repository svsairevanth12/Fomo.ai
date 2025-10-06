import { useEffect, useCallback, useState, useRef } from 'react';
import { useMeetingStore } from '@/stores/meetingStore';
import { api } from '@/services/api';
import { PythonAudioAPI } from '@/services/pythonAudioApi';

export const useMeetingRecorder = () => {
  const {
    currentMeeting,
    recordingState,
    startMeeting,
    stopMeeting,
    pauseMeeting,
    resumeMeeting,
    updateDuration,
    addTranscriptSegment,
    addActionItem
  } = useMeetingStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [chunksProcessed, setChunksProcessed] = useState(0);
  const pollingStopRef = useRef<(() => void) | null>(null);
  const lastTranscriptLengthRef = useRef(0);

  // Update duration every second when recording
  useEffect(() => {
    if (!recordingState.isRecording || recordingState.isPaused) return;

    const interval = setInterval(() => {
      updateDuration();
    }, 1000);

    return () => clearInterval(interval);
  }, [recordingState.isRecording, recordingState.isPaused, updateDuration]);

  // Poll for transcript updates from Python backend
  const startTranscriptPolling = useCallback((meetingId: string) => {
    console.log('[MeetingRecorder] Starting transcript polling...');
    
    const stopPolling = PythonAudioAPI.startPolling(
      meetingId,
      (meetingData) => {
        if (meetingData.transcript && meetingData.transcript.length > lastTranscriptLengthRef.current) {
          // New transcript segments available
          const newSegments = meetingData.transcript.slice(lastTranscriptLengthRef.current);
          
          newSegments.forEach((segment: any) => {
            addTranscriptSegment({
              id: segment.id,
              speaker: segment.speaker,
              text: segment.text,
              timestamp: segment.timestamp,
              confidence: segment.confidence,
              startTime: segment.startTime,
              endTime: segment.endTime
            });
          });
          
          lastTranscriptLengthRef.current = meetingData.transcript.length;
          console.log(`[MeetingRecorder] Added ${newSegments.length} new transcript segments`);
        }
        
        // Update chunks processed count
        if (meetingData.chunksProcessed !== undefined) {
          setChunksProcessed(meetingData.chunksProcessed);
        }
      },
      3000 // Poll every 3 seconds
    );
    
    pollingStopRef.current = stopPolling;
  }, [addTranscriptSegment]);

  const handleStart = useCallback(async () => {
    try {
      console.log('[MeetingRecorder] Starting Python-based audio capture...');
      
      // Start local meeting
      startMeeting();

      const meetingId = `meeting_${Date.now()}`;

      // Create meeting on backend
      await api.createMeeting({
        id: meetingId,
        title: `Meeting ${new Date().toLocaleString()}`,
      });

      // Start Python audio capture
      const result = await PythonAudioAPI.startCapture(meetingId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to start audio capture');
      }

      console.log('[MeetingRecorder] Audio capture started successfully');

      // Start polling for transcript updates
      startTranscriptPolling(meetingId);

      // Notify backend
      await api.startRecording();

    } catch (error) {
      console.error('[MeetingRecorder] Failed to start recording:', error);
      alert('Failed to start recording. Please ensure the Python backend is running and audio devices are available.');
      stopMeeting();
    }
  }, [startMeeting, stopMeeting, startTranscriptPolling]);

  const handleStop = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      console.log('[MeetingRecorder] Stopping recording...');

      // Stop polling
      if (pollingStopRef.current) {
        pollingStopRef.current();
        pollingStopRef.current = null;
      }

      // Stop Python audio capture
      const result = await PythonAudioAPI.stopCapture();

      if (!result.success) {
        console.error('[MeetingRecorder] Error stopping capture:', result.error);
      } else {
        console.log(`[MeetingRecorder] Capture stopped. Total chunks: ${result.total_chunks}`);
      }

      // Generate meeting summary and action items
      setIsProcessing(true);
      console.log('[MeetingRecorder] Generating meeting summary...');

      // Wait a bit for final transcription to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      const summaryResponse = await api.generateMeetingSummary(currentMeeting.id);

      if (summaryResponse.success && summaryResponse.data) {
        console.log('[MeetingRecorder] Meeting summary generated successfully');
        
        // Add action items if available
        if (summaryResponse.data.actionItems) {
          summaryResponse.data.actionItems.forEach((item: any) => {
            addActionItem({
              id: item.id,
              text: item.text,
              assignee: item.assignee || undefined,
              priority: item.priority || 'medium',
              status: item.status || 'pending',
              meetingId: currentMeeting.id,
              timestamp: item.timestamp || Date.now(),
              context: item.context
            });
          });
        }
      }

      // Notify backend
      await api.stopRecording(currentMeeting.id);

      // Stop local meeting
      stopMeeting();

      setChunksProcessed(0);
      setIsProcessing(false);
      lastTranscriptLengthRef.current = 0;

      console.log('[MeetingRecorder] Recording stopped successfully');
    } catch (error) {
      console.error('[MeetingRecorder] Failed to stop recording:', error);
      setIsProcessing(false);
    }
  }, [currentMeeting, stopMeeting, addActionItem]);

  const handlePause = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      // Note: Python backend doesn't support pause/resume yet
      // This would need to be implemented in audio_capture.py
      console.warn('[MeetingRecorder] Pause not yet supported in Python backend');

      pauseMeeting();
      await api.pauseRecording(currentMeeting.id);

      console.log('[MeetingRecorder] Recording paused');
    } catch (error) {
      console.error('[MeetingRecorder] Failed to pause recording:', error);
    }
  }, [currentMeeting, pauseMeeting]);

  const handleResume = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      // Note: Python backend doesn't support pause/resume yet
      console.warn('[MeetingRecorder] Resume not yet supported in Python backend');

      resumeMeeting();
      await api.resumeRecording(currentMeeting.id);

      console.log('[MeetingRecorder] Recording resumed');
    } catch (error) {
      console.error('[MeetingRecorder] Failed to resume recording:', error);
    }
  }, [currentMeeting, resumeMeeting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingStopRef.current) {
        pollingStopRef.current();
      }
    };
  }, []);

  return {
    currentMeeting,
    recordingState,
    start: handleStart,
    stop: handleStop,
    pause: handlePause,
    resume: handleResume,
    isProcessing,
    chunksProcessed
  };
};

