import { useEffect, useRef, useCallback, useState } from 'react';
import type { WebSocketMessage, TranscriptSegment, ActionItem } from '@/types';
import { useMeetingStore } from '@/stores/meetingStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws/transcript';

export const useWebSocket = (meetingId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { addTranscriptSegment, addActionItem } = useMeetingStore();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'transcript':
            addTranscriptSegment(message.data as TranscriptSegment);
            break;
          case 'action_item':
            addActionItem(message.data as ActionItem);
            break;
          case 'status':
            console.log('Status update:', message.data);
            break;
          case 'error':
            console.error('WebSocket error:', message.data);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    },
    [addTranscriptSegment, addActionItem]
  );

  const connect = useCallback(() => {
    if (!meetingId) return;

    try {
      const ws = new WebSocket(`${WS_URL}?meeting_id=${meetingId}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [meetingId, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (meetingId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [meetingId, connect, disconnect]);

  return { isConnected, reconnect: connect };
};
