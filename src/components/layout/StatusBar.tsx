import React from 'react';
import { Wifi, WifiOff, Circle } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface StatusBarProps {
  isRecording: boolean;
  duration: number;
  isConnected: boolean;
  transcriptSegments: number;
  actionItems: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isRecording,
  duration,
  isConnected,
  transcriptSegments,
  actionItems
}) => {
  return (
    <div className="h-8 bg-black border-t-2 border-white/10 flex items-center justify-between px-4 text-xs font-mono uppercase tracking-wider">
      {/* Left side - Recording status */}
      <div className="flex items-center gap-6">
        {isRecording && (
          <>
            <div className="flex items-center gap-2">
              <Circle className="w-2 h-2 fill-white text-white animate-pulse" />
              <span className="font-bold">{formatDuration(duration)}</span>
            </div>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">{transcriptSegments} SEG</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">{actionItems} ITEMS</span>
          </>
        )}
        {!isRecording && <span className="text-gray-600">[ IDLE ]</span>}
      </div>

      {/* Right side - Connection status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-gray-500">CONNECTED</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-gray-700" />
            <span className="text-gray-700">OFFLINE</span>
          </>
        )}
      </div>
    </div>
  );
};
