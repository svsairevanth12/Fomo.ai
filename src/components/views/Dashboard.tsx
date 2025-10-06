import React, { useState } from 'react';
import { Plus, Mic, Video, FileText, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { useMeetingStore } from '@/stores/meetingStore';

interface DashboardProps {
  onViewMeeting: (meetingId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewMeeting }) => {
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const { startMeeting, meetings } = useMeetingStore();

  const handleCreateMeeting = () => {
    if (meetingTitle.trim()) {
      startMeeting(meetingTitle);
      setMeetingTitle('');
      setShowNewMeeting(false);
    }
  };

  const recentMeetings = meetings.slice(0, 3);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            Manage your AI-powered meetings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="relative group cursor-pointer"
            onClick={() => setShowNewMeeting(true)}
          >
            <Card className="h-full border-2 border-white/20 hover:border-white transition-all bg-gradient-to-br from-gray-900 to-black">
              <div className="p-8 space-y-4">
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase">New Meeting</h3>
                  <p className="text-gray-500 text-sm mt-2">Start recording a new meeting</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="relative group">
            <Card className="h-full border-2 border-gray-800 hover:border-gray-700 transition-all">
              <div className="p-8 space-y-4">
                <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center border-2 border-gray-800">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase">Transcripts</h3>
                  <p className="text-gray-500 text-sm mt-2">{meetings.length} total meetings</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="relative group">
            <Card className="h-full border-2 border-gray-800 hover:border-gray-700 transition-all">
              <div className="p-8 space-y-4">
                <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center border-2 border-gray-800">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase">History</h3>
                  <p className="text-gray-500 text-sm mt-2">View past recordings</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* New Meeting Modal */}
        {showNewMeeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewMeeting(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-2 border-white p-8 space-y-6 bg-black">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase">New Meeting</h2>
                  <p className="text-gray-500 text-sm">Create a new meeting session</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold mb-2">
                      Meeting Title
                    </label>
                    <input
                      type="text"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      placeholder="e.g., Team Standup - Jan 15"
                      className="w-full px-4 py-3 bg-black border-2 border-white/20 focus:border-white transition-all text-white placeholder:text-gray-600 outline-none"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateMeeting()}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleCreateMeeting}
                      disabled={!meetingTitle.trim()}
                      className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      Start
                    </button>
                    <button
                      onClick={() => setShowNewMeeting(false)}
                      className="px-6 py-3 bg-black text-white border-2 border-white/20 hover:border-white font-bold uppercase tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Recent Meetings */}
        {recentMeetings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase">Recent Meetings</h2>
            <div className="space-y-3">
              {recentMeetings.map((meeting) => (
                <motion.div key={meeting.id} whileHover={{ x: 4 }}>
                  <Card className="border-2 border-gray-800 hover:border-gray-700 transition-all p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{meeting.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.startTime).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {Math.floor(meeting.duration / 60)}m {meeting.duration % 60}s
                          </span>
                          <span>{meeting.transcript.length} segments</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewMeeting(meeting.id)}
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Getting Started */}
        {meetings.length === 0 && (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 bg-white/5 border-2 border-white/10 mx-auto flex items-center justify-center">
              <Mic className="w-12 h-12 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase">No meetings yet</h3>
              <p className="text-gray-500">Click "New Meeting" to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
