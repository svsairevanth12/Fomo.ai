import React from 'react';
import { StopCircle } from 'lucide-react';
import { RecordingControl } from '@/components/meeting/RecordingControl';
import { LiveTranscript } from '@/components/meeting/LiveTranscript';
import { ActionItemCard } from '@/components/actionItems/ActionItemCard';
import { Button } from '@/components/shared/Button';
import { useMeetingRecorder } from '@/hooks/useMeetingRecorder';
import { useActionItems } from '@/hooks/useActionItems';
import { useMeetingStore } from '@/stores/meetingStore';

export const LiveMeeting: React.FC = () => {
  const { currentMeeting, recordingState, start, stop, pause, resume, isProcessing, chunksProcessed } = useMeetingRecorder();
  const { createGitHubIssue } = useActionItems();
  const { updateTranscriptSegment, approveActionItem, stopMeeting } = useMeetingStore();

  if (!currentMeeting) return null;

  const handleEndMeeting = () => {
    if (confirm('Are you sure you want to end this meeting? This will stop recording and save the meeting.')) {
      if (recordingState.isRecording) {
        stop();
      }
      stopMeeting();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Meeting Header */}
      <div className="border-b border-gray-800 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase">{currentMeeting.title}</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-wider">
            {recordingState.isRecording ? 'Recording in progress' : 'Meeting paused'}
            {isProcessing && ' • Processing audio...'}
            {chunksProcessed > 0 && ` • ${chunksProcessed} chunks transcribed`}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleEndMeeting}
          icon={<StopCircle className="w-4 h-4" />}
          className="border-2 border-gray-800 hover:border-red-500 hover:text-red-500"
        >
          End Meeting
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Recording & Transcript */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <RecordingControl
            recordingState={recordingState}
            onStart={start}
            onStop={stop}
            onPause={pause}
            onResume={resume}
          />

          <div className="flex-1 overflow-hidden border-t border-gray-800">
            <LiveTranscript
              segments={currentMeeting.transcript}
              onEdit={updateTranscriptSegment}
            />
          </div>
        </div>

        {/* Right: Action Items */}
        <div className="w-96 border-l border-gray-800 flex flex-col overflow-hidden bg-black">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-black uppercase">Action Items</h2>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">
              {currentMeeting.actionItems.length} detected
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentMeeting.actionItems.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                onCreateIssue={createGitHubIssue}
                onApprove={() => approveActionItem(item.id)}
              />
            ))}

            {currentMeeting.actionItems.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-700 text-xs">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-black">[ EMPTY ]</div>
                  <div className="uppercase tracking-widest">AI is listening...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
