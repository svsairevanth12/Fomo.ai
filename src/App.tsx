import React, { useState } from 'react';
import { Titlebar } from '@/components/layout/Titlebar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBar } from '@/components/layout/StatusBar';
import { Dashboard } from '@/components/views/Dashboard';
import { LiveMeeting } from '@/components/views/LiveMeeting';
import { MeetingHistory } from '@/components/views/MeetingHistory';
import { MeetingDetail } from '@/components/views/MeetingDetail';
import { SettingsView } from '@/components/views/SettingsView';
import { useMeetingStore } from '@/stores/meetingStore';
import type { Route } from '@/types';

function App() {
  const [activeRoute, setActiveRoute] = useState<Route>('live');
  const [viewingMeetingId, setViewingMeetingId] = useState<string | null>(null);
  const { currentMeeting, meetings } = useMeetingStore();
  const isConnected = true; // Always connected (no WebSocket needed)

  const handleViewMeeting = (meetingId: string) => {
    setViewingMeetingId(meetingId);
    setActiveRoute('history');
  };

  const handleBackFromDetail = () => {
    setViewingMeetingId(null);
  };

  const renderView = () => {
    // If viewing a specific meeting, show detail view
    if (viewingMeetingId) {
      return <MeetingDetail meetingId={viewingMeetingId} onBack={handleBackFromDetail} />;
    }

    switch (activeRoute) {
      case 'live':
        return currentMeeting ? <LiveMeeting /> : <Dashboard onViewMeeting={handleViewMeeting} />;
      case 'history':
        return <MeetingHistory onViewMeeting={handleViewMeeting} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard onViewMeeting={handleViewMeeting} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <Titlebar />

      <div className="flex flex-1 overflow-hidden border-t border-gray-800">
        <Sidebar
          activeRoute={activeRoute}
          onNavigate={setActiveRoute}
          isRecording={currentMeeting?.status === 'recording'}
          meetingCount={meetings.length}
        />

        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div className="relative z-10 h-full overflow-auto">
            {renderView()}
          </div>
        </main>
      </div>

      <StatusBar
        isRecording={currentMeeting?.status === 'recording'}
        duration={currentMeeting?.duration || 0}
        isConnected={isConnected}
        transcriptSegments={currentMeeting?.transcript.length || 0}
        actionItems={currentMeeting?.actionItems.length || 0}
      />
    </div>
  );
}

export default App;
