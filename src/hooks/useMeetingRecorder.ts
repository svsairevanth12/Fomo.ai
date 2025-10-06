import { useEffect, useCallback, useState } from 'react';
import { useMeetingStore } from '@/stores/meetingStore';
import { api } from '@/services/api';
import { audioRecorder, type AudioChunk } from '@/services/audioRecorder';

export const useMeetingRecorder = () => {
  const {
    currentMeeting,
    recordingState,
    startMeeting,
    stopMeeting,
    pauseMeeting,
    resumeMeeting,
    updateDuration,
    addTranscriptSegment
  } = useMeetingStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [chunksProcessed, setChunksProcessed] = useState(0);

  // Update duration every second when recording
  useEffect(() => {
    if (!recordingState.isRecording || recordingState.isPaused) return;

    const interval = setInterval(() => {
      updateDuration();
    }, 1000);

    return () => clearInterval(interval);
  }, [recordingState.isRecording, recordingState.isPaused, updateDuration]);

  // Handle audio chunk ready - send to backend for transcription
  const handleChunkReady = useCallback(async (chunk: AudioChunk) => {
    try {
      setIsProcessing(true);
      console.log(`Processing chunk ${chunk.chunkIndex}...`);

      // Save chunk to IndexedDB
      await audioRecorder.saveChunkToStorage(chunk);

      // Send chunk to backend for transcription
      const formData = new FormData();
      formData.append('audio', chunk.blob, `chunk_${chunk.chunkIndex}.webm`);
      formData.append('meetingId', chunk.meetingId);
      formData.append('chunkIndex', chunk.chunkIndex.toString());

      const response = await api.transcribeAudioChunk(formData);

      if (response.success && response.data) {
        // Add transcript segments to meeting
        response.data.segments.forEach((segment: any) => {
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

        setChunksProcessed((prev) => prev + 1);
        console.log(`Chunk ${chunk.chunkIndex} transcribed successfully`);
      }
    } catch (error) {
      console.error('Failed to process audio chunk:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [addTranscriptSegment]);

  const handleStart = useCallback(async () => {
    try {
      // Check if browser supports audio recording
      if (!audioRecorder.constructor.isSupported()) {
        throw new Error('Audio recording not supported in this browser');
      }

      // Start local meeting
      startMeeting();

      const meetingId = `meeting_${Date.now()}`;

      // Start audio recording with chunk callback
      await audioRecorder.startRecording(meetingId, handleChunkReady);

      // Notify backend
      await api.startRecording();

      console.log('Meeting recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please ensure you grant audio permissions.');
      stopMeeting();
    }
  }, [startMeeting, stopMeeting, handleChunkReady]);

  const handleStop = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      console.log('Stopping recording...');

      // Stop audio recording and get final chunks
      const finalChunks = await audioRecorder.stopRecording();

      // Process any remaining chunks
      for (const chunk of finalChunks) {
        if (chunk.blob.size > 0) {
          await handleChunkReady(chunk);
        }
      }

      // Generate meeting summary and action items
      setIsProcessing(true);
      console.log('Generating meeting summary...');

      const summaryResponse = await api.generateMeetingSummary(currentMeeting.id);

      if (summaryResponse.success) {
        console.log('Meeting summary generated successfully');
      }

      // Notify backend
      await api.stopRecording(currentMeeting.id);

      // Clear chunks from storage
      await audioRecorder.clearMeetingChunks(currentMeeting.id);

      // Stop local meeting
      stopMeeting();

      setChunksProcessed(0);
      setIsProcessing(false);

      console.log('Recording stopped successfully');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
    }
  }, [currentMeeting, stopMeeting, handleChunkReady]);

  const handlePause = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      // Pause audio recording
      audioRecorder.pauseRecording();

      pauseMeeting();
      await api.pauseRecording(currentMeeting.id);

      console.log('Recording paused');
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  }, [currentMeeting, pauseMeeting]);

  const handleResume = useCallback(async () => {
    try {
      if (!currentMeeting) return;

      // Resume audio recording
      audioRecorder.resumeRecording();

      resumeMeeting();
      await api.resumeRecording(currentMeeting.id);

      console.log('Recording resumed');
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
    resume: handleResume,
    isProcessing,
    chunksProcessed
  };
};
