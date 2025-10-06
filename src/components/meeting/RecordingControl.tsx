import React from 'react';
import { Play, Square, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDuration } from '@/lib/utils';
import type { RecordingState } from '@/types';

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

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8 border-b-2 border-white/10">
      {/* Main recording button */}
      <div className="relative">
        {isRecording && (
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

        <motion.button
          onClick={isRecording ? onStop : onStart}
          className={`
            relative w-24 h-24 flex items-center justify-center
            border-4 transition-all
            ${isRecording
              ? 'bg-white text-black border-white glow-white'
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
    </div>
  );
};
