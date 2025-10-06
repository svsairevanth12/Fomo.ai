import React, { useState, useEffect } from 'react';
import { Play, Square, Pause, Settings, Speaker } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDuration } from '@/lib/utils';
import type { RecordingState } from '@/types';
import { AudioDeviceSelector } from '@/components/settings/AudioDeviceSelector';
import { PythonAudioAPI, type AudioDevice } from '@/services/pythonAudioApi';

interface RecordingControlProps {
  recordingState: RecordingState;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export const RecordingControl: React.FC<RecordingControlProps> = ({
  recordingState,
  onStart,
  onStop,
  onPause,
  onResume
}) => {
  const { isRecording, isPaused, duration } = recordingState;
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [selectedDeviceName, setSelectedDeviceName] = useState<string>('Default Device');

  // Load selected device name on mount
  useEffect(() => {
    loadSelectedDeviceName();
  }, []);

  const loadSelectedDeviceName = async () => {
    const savedDeviceId = localStorage.getItem('selectedAudioDevice');
    if (savedDeviceId) {
      try {
        const result = await PythonAudioAPI.listDevices();
        if (result.success && result.data) {
          const device = result.data.find((d: AudioDevice) => d.id === parseInt(savedDeviceId, 10));
          if (device) {
            setSelectedDeviceName(device.name);
          }
        }
      } catch (error) {
        console.error('[RecordingControl] Error loading device name:', error);
      }
    }
  };

  const handleDeviceSelected = (deviceId: number) => {
    loadSelectedDeviceName();
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8 border-b-2 border-white/10">
      {/* Device Selector Button (only when not recording) */}
      {!isRecording && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowDeviceSelector(true)}
          className="px-6 py-2 bg-black text-white border-2 border-gray-800
                     hover:border-white transition-all
                     font-bold uppercase tracking-widest text-xs
                     flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Speaker className="w-4 h-4" />
          {selectedDeviceName}
          <Settings className="w-3 h-3 ml-1" />
        </motion.button>
      )}

      {/* Selected Device Display (when recording) */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2"
        >
          <Speaker className="w-3 h-3" />
          {selectedDeviceName}
        </motion.div>
      )}

      {/* Main recording button */}
      <div className="relative">
        {isRecording && !isPaused && (
          <motion.div
            className="absolute -inset-4 border-2 border-white"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}

        {/* Paused Badge */}
        {isRecording && isPaused && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2
                       px-3 py-1 bg-yellow-500 text-black border-2 border-yellow-500
                       font-bold uppercase text-xs tracking-wider"
          >
            PAUSED
          </motion.div>
        )}

        <motion.button
          onClick={isRecording ? onStop : onStart}
          className={`
            relative w-24 h-24 flex items-center justify-center
            border-4 transition-all
            ${isRecording && !isPaused
              ? 'bg-white text-black border-white glow-white'
              : isRecording && isPaused
              ? 'bg-yellow-500 text-black border-yellow-500'
              : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRecording ? (
            <Square className="w-10 h-10 fill-current" />
          ) : (
            <Play className="w-10 h-10 ml-1" />
          )}
        </motion.button>
      </div>

      {/* Duration */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-mono font-black tracking-wider"
        >
          {formatDuration(duration)}
        </motion.div>
      )}

      {/* Pause/Resume button */}
      {isRecording && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={isPaused ? onResume : onPause}
          className="px-8 py-3 bg-black text-white border-2 border-white
                     hover:bg-white hover:text-black transition-all
                     font-bold uppercase tracking-widest text-sm
                     flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Pause className="w-4 h-4" />
          {isPaused ? 'RESUME' : 'PAUSE'}
        </motion.button>
      )}

      {/* Status text */}
      <div className="text-gray-600 text-xs uppercase tracking-widest font-bold">
        {!isRecording && '[ PRESS TO RECORD ]'}
        {isRecording && !isPaused && '[ RECORDING ]'}
        {isRecording && isPaused && '[ PAUSED ]'}
      </div>

      {/* Audio Device Selector Modal */}
      <AudioDeviceSelector
        isOpen={showDeviceSelector}
        onClose={() => setShowDeviceSelector(false)}
        onDeviceSelected={handleDeviceSelected}
      />
    </div>
  );
};
