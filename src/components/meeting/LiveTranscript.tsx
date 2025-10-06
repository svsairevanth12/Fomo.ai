import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { getSpeakerColor, formatTimestamp } from '@/lib/utils';
import type { TranscriptSegment } from '@/types';

interface LiveTranscriptProps {
  segments: TranscriptSegment[];
  onEdit?: (segmentId: string, newText: string) => void;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  segments,
  onEdit
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new segments arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [segments]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-100">Live Transcript</h2>
        <p className="text-sm text-neutral-400">{segments.length} segments</p>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <AnimatePresence>
          {segments.map((segment, index) => (
            <TranscriptSegmentCard
              key={segment.id}
              segment={segment}
              isLatest={index === segments.length - 1}
              onEdit={onEdit}
            />
          ))}
        </AnimatePresence>

        {segments.length === 0 && (
          <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
            Transcript will appear here when recording starts
          </div>
        )}
      </div>
    </div>
  );
};

interface TranscriptSegmentCardProps {
  segment: TranscriptSegment;
  isLatest: boolean;
  onEdit?: (segmentId: string, newText: string) => void;
}

const TranscriptSegmentCard: React.FC<TranscriptSegmentCardProps> = ({
  segment,
  isLatest,
  onEdit
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(segment.text);

  const handleSave = () => {
    if (onEdit && editText !== segment.text) {
      onEdit(segment.id, editText);
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className={isLatest ? 'ring-2 ring-primary-500/30' : ''}>
        <div className="flex items-start gap-3">
          {/* Speaker badge */}
          <Badge className={getSpeakerColor(segment.speaker)}>
            {segment.speaker}
          </Badge>

          <div className="flex-1">
            {/* Text */}
            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSave();
                  }
                }}
                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                autoFocus
              />
            ) : (
              <p className="text-sm text-neutral-200">{segment.text}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
              <span>{formatTimestamp(segment.startTime)}</span>
              {segment.confidence < 0.9 && (
                <span className="text-warning-500">Low confidence</span>
              )}
            </div>
          </div>

          {/* Edit button */}
          {onEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-neutral-800 rounded"
            >
              <Edit2 className="w-4 h-4 text-neutral-400" />
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
