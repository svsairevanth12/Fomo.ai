import React from 'react';
import { Calendar, Clock, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useMeetingStore } from '@/stores/meetingStore';
import { formatDuration } from '@/lib/utils';

interface MeetingHistoryProps {
  onViewMeeting: (meetingId: string) => void;
}

export const MeetingHistory: React.FC<MeetingHistoryProps> = ({ onViewMeeting }) => {
  const { meetings, deleteMeeting } = useMeetingStore();

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight">Meeting History</h1>
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            {meetings.length} total meetings recorded
          </p>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 bg-white/5 border-2 border-white/10 mx-auto flex items-center justify-center">
              <FileText className="w-12 h-12 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase">No meetings yet</h3>
              <p className="text-gray-500">Start recording to see meetings here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-2 border-gray-800 hover:border-gray-700 transition-all p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-black text-xl">{meeting.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.startTime).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatDuration(meeting.duration)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-gray-600 uppercase tracking-wider">
                        <span>{meeting.transcript.length} segments</span>
                        <span>•</span>
                        <span>{meeting.actionItems.length} action items</span>
                        <span>•</span>
                        <span className="uppercase">{meeting.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewMeeting(meeting.id)}
                      >
                        View
                      </Button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${meeting.title}"? This cannot be undone.`)) {
                            deleteMeeting(meeting.id);
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-900 border-2 border-transparent hover:border-red-800 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
