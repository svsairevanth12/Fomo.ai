import type { TranscriptSegment, ActionItem } from '@/types';

/**
 * Generate mock transcript segments for testing
 */
export const generateMockTranscript = (meetingId: string): TranscriptSegment[] => {
  return [
    {
      id: `seg_${meetingId}_0`,
      speaker: 'Speaker A',
      text: 'Good morning everyone! Thanks for joining today\'s standup. Let\'s go around and share what we\'re working on.',
      timestamp: 0,
      confidence: 0.95,
      startTime: 0,
      endTime: 5.2
    },
    {
      id: `seg_${meetingId}_1`,
      speaker: 'Speaker B',
      text: 'Sure! I\'ve been working on the new authentication system. I should have it ready for review by end of day.',
      timestamp: 5.5,
      confidence: 0.92,
      startTime: 5.5,
      endTime: 11.8
    },
    {
      id: `seg_${meetingId}_2`,
      speaker: 'Speaker A',
      text: 'Great! Make sure to add unit tests before submitting the PR. We need to maintain our code coverage.',
      timestamp: 12,
      confidence: 0.94,
      startTime: 12,
      endTime: 17.5
    },
    {
      id: `seg_${meetingId}_3`,
      speaker: 'Speaker C',
      text: 'I\'m working on the dashboard redesign. I\'ve completed the wireframes and I\'m starting on the implementation.',
      timestamp: 18,
      confidence: 0.91,
      startTime: 18,
      endTime: 24.3
    },
    {
      id: `seg_${meetingId}_4`,
      speaker: 'Speaker A',
      text: 'Excellent. Can you share those wireframes in Slack so the team can review them?',
      timestamp: 24.5,
      confidence: 0.96,
      startTime: 24.5,
      endTime: 29.1
    },
    {
      id: `seg_${meetingId}_5`,
      speaker: 'Speaker C',
      text: 'Absolutely, I\'ll post them right after this meeting.',
      timestamp: 29.5,
      confidence: 0.93,
      startTime: 29.5,
      endTime: 32.8
    },
    {
      id: `seg_${meetingId}_6`,
      speaker: 'Speaker B',
      text: 'One thing - I\'m blocked on the API documentation. The endpoints aren\'t clearly defined yet.',
      timestamp: 33,
      confidence: 0.89,
      startTime: 33,
      endTime: 38.5
    },
    {
      id: `seg_${meetingId}_7`,
      speaker: 'Speaker A',
      text: 'Good point. Let\'s schedule a quick sync with the backend team this afternoon to clarify the API specs.',
      timestamp: 39,
      confidence: 0.94,
      startTime: 39,
      endTime: 45.2
    }
  ];
};

/**
 * Generate mock action items for testing
 */
export const generateMockActionItems = (meetingId: string): ActionItem[] => {
  return [
    {
      id: `action_${meetingId}_0`,
      text: 'Add unit tests to authentication system PR',
      assignee: 'Speaker B',
      context: 'Make sure to add unit tests before submitting the PR. We need to maintain our code coverage.',
      priority: 'high',
      status: 'pending',
      meetingId,
      timestamp: Date.now()
    },
    {
      id: `action_${meetingId}_1`,
      text: 'Share dashboard wireframes in Slack',
      assignee: 'Speaker C',
      context: 'Can you share those wireframes in Slack so the team can review them?',
      priority: 'medium',
      status: 'pending',
      meetingId,
      timestamp: Date.now()
    },
    {
      id: `action_${meetingId}_2`,
      text: 'Schedule sync with backend team for API documentation',
      assignee: 'Speaker A',
      context: 'Let\'s schedule a quick sync with the backend team this afternoon to clarify the API specs.',
      priority: 'high',
      status: 'pending',
      meetingId,
      timestamp: Date.now()
    }
  ];
};

