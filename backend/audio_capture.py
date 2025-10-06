"""
Python-based System Audio Capture Service
Captures system audio directly using soundcard library (Windows)
Implements chunked recording with automatic transcription
"""

import soundcard as sc
import numpy as np
import threading
import time
import os
from datetime import datetime
import wave
import io
from typing import Optional, Callable, List
import queue


class AudioCaptureService:
    """
    System audio capture service with chunked recording
    Records in 2-minute intervals and processes each chunk
    """
    
    def __init__(self, chunk_duration: int = 120):
        """
        Initialize audio capture service
        
        Args:
            chunk_duration: Duration of each chunk in seconds (default: 120 = 2 minutes)
        """
        self.chunk_duration = chunk_duration
        self.sample_rate = 44100
        self.channels = 2
        self.is_recording = False
        self.recording_thread: Optional[threading.Thread] = None
        self.current_meeting_id: Optional[str] = None
        self.chunk_index = 0
        self.chunk_callback: Optional[Callable] = None
        self.audio_queue = queue.Queue()
        self.data_dir = 'data'
        os.makedirs(self.data_dir, exist_ok=True)
        
    def start_recording(self, meeting_id: str, chunk_callback: Optional[Callable] = None):
        """
        Start recording system audio
        
        Args:
            meeting_id: Unique identifier for the meeting
            chunk_callback: Function to call when a chunk is ready (receives chunk_path, chunk_index)
        """
        if self.is_recording:
            raise Exception("Recording already in progress")
        
        self.current_meeting_id = meeting_id
        self.chunk_index = 0
        self.chunk_callback = chunk_callback
        self.is_recording = True
        
        # Start recording in a separate thread
        self.recording_thread = threading.Thread(target=self._record_loop, daemon=True)
        self.recording_thread.start()
        
        print(f"[AudioCapture] Started recording for meeting: {meeting_id}")
        
    def stop_recording(self) -> dict:
        """
        Stop recording and return summary
        
        Returns:
            dict: Summary of recording session
        """
        if not self.is_recording:
            return {'success': False, 'error': 'No recording in progress'}
        
        self.is_recording = False
        
        # Wait for recording thread to finish
        if self.recording_thread:
            self.recording_thread.join(timeout=5)
        
        summary = {
            'success': True,
            'meeting_id': self.current_meeting_id,
            'total_chunks': self.chunk_index,
            'duration_seconds': self.chunk_index * self.chunk_duration
        }
        
        print(f"[AudioCapture] Stopped recording. Total chunks: {self.chunk_index}")
        
        # Reset state
        self.current_meeting_id = None
        self.chunk_index = 0
        
        return summary
    
    def _record_loop(self):
        """
        Main recording loop - captures audio in chunks
        """
        try:
            # Get default loopback device (system audio)
            # On Windows, this captures all system audio output
            speakers = sc.default_speaker()
            
            print(f"[AudioCapture] Using audio device: {speakers.name}")
            
            # Record in chunks
            with speakers.recorder(samplerate=self.sample_rate, channels=self.channels) as mic:
                while self.is_recording:
                    # Record one chunk (chunk_duration seconds)
                    print(f"[AudioCapture] Recording chunk {self.chunk_index}...")
                    
                    # Calculate number of frames for chunk duration
                    frames_per_chunk = int(self.sample_rate * self.chunk_duration)
                    
                    # Record audio data
                    audio_data = mic.record(numframes=frames_per_chunk)
                    
                    if not self.is_recording:
                        break
                    
                    # Save chunk to file
                    chunk_path = self._save_chunk(audio_data, self.chunk_index)
                    
                    print(f"[AudioCapture] Chunk {self.chunk_index} saved: {chunk_path}")
                    
                    # Call callback if provided
                    if self.chunk_callback:
                        try:
                            self.chunk_callback(chunk_path, self.chunk_index, self.current_meeting_id)
                        except Exception as e:
                            print(f"[AudioCapture] Error in chunk callback: {e}")
                    
                    self.chunk_index += 1
                    
        except Exception as e:
            print(f"[AudioCapture] Recording error: {e}")
            self.is_recording = False
    
    def _save_chunk(self, audio_data: np.ndarray, chunk_index: int) -> str:
        """
        Save audio chunk to WAV file
        
        Args:
            audio_data: Audio data as numpy array
            chunk_index: Index of the chunk
            
        Returns:
            str: Path to saved file
        """
        filename = f"{self.current_meeting_id}_chunk_{chunk_index}.wav"
        filepath = os.path.join(self.data_dir, filename)
        
        # Convert float32 to int16
        audio_int16 = (audio_data * 32767).astype(np.int16)
        
        # Save as WAV file
        with wave.open(filepath, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(self.sample_rate)
            wf.writeframes(audio_int16.tobytes())
        
        return filepath
    
    def get_status(self) -> dict:
        """
        Get current recording status
        
        Returns:
            dict: Status information
        """
        return {
            'is_recording': self.is_recording,
            'meeting_id': self.current_meeting_id,
            'current_chunk': self.chunk_index,
            'chunk_duration': self.chunk_duration
        }
    
    @staticmethod
    def list_audio_devices() -> List[dict]:
        """
        List available audio devices
        
        Returns:
            List[dict]: List of audio devices
        """
        devices = []
        
        try:
            # Get all speakers (output devices)
            all_speakers = sc.all_speakers()
            for i, speaker in enumerate(all_speakers):
                devices.append({
                    'id': i,
                    'name': speaker.name,
                    'type': 'output',
                    'is_loopback': speaker.isloopback if hasattr(speaker, 'isloopback') else False
                })
            
            # Get all microphones (input devices)
            all_mics = sc.all_microphones()
            for i, mic in enumerate(all_mics):
                devices.append({
                    'id': i + len(all_speakers),
                    'name': mic.name,
                    'type': 'input',
                    'is_loopback': False
                })
                
        except Exception as e:
            print(f"[AudioCapture] Error listing devices: {e}")
        
        return devices
    
    @staticmethod
    def test_audio_capture(duration: int = 5) -> dict:
        """
        Test audio capture for a few seconds
        
        Args:
            duration: Test duration in seconds
            
        Returns:
            dict: Test results
        """
        try:
            speakers = sc.default_speaker()
            
            print(f"[AudioCapture] Testing audio capture for {duration} seconds...")
            
            with speakers.recorder(samplerate=44100) as mic:
                data = mic.record(numframes=44100 * duration)
            
            # Calculate audio level
            audio_level = np.abs(data).mean()
            
            return {
                'success': True,
                'device': speakers.name,
                'duration': duration,
                'audio_level': float(audio_level),
                'has_audio': audio_level > 0.001
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


# Global instance
audio_service = AudioCaptureService()


def get_audio_service() -> AudioCaptureService:
    """Get the global audio service instance"""
    return audio_service

