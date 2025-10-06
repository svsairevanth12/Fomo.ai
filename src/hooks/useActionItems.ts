import { useCallback } from 'react';
import { useMeetingStore } from '@/stores/meetingStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { github } from '@/services/github';
import type { ActionItem } from '@/types';

export const useActionItems = () => {
  const { currentMeeting, updateActionItem } = useMeetingStore();
  const { github: githubAuth } = useAuthStore();
  const { integrations } = useSettingsStore();

  const createGitHubIssue = useCallback(
    async (actionItem: ActionItem) => {
      if (!githubAuth || !integrations.github?.defaultRepository) {
        throw new Error('GitHub not configured');
      }

      // Update status to creating
      updateActionItem(actionItem.id, { status: 'creating' });

      try {
        // Parse repository owner/name
        const [owner, repo] = integrations.github.defaultRepository.split('/');

        // Create issue
        const issue = await github.createIssueFromActionItem(
          owner,
          repo,
          actionItem,
          currentMeeting?.title || 'Meeting'
        );

        // Update action item with GitHub issue info
        updateActionItem(actionItem.id, {
          status: 'created',
          githubIssue: {
            number: issue.number,
            url: issue.html_url,
            repository: integrations.github.defaultRepository
          }
        });

        return issue;
      } catch (error) {
        console.error('Failed to create GitHub issue:', error);
        updateActionItem(actionItem.id, { status: 'failed' });
        throw error;
      }
    },
    [githubAuth, integrations.github, currentMeeting, updateActionItem]
  );

  const updateItem = useCallback(
    (itemId: string, updates: Partial<ActionItem>) => {
      updateActionItem(itemId, updates);
    },
    [updateActionItem]
  );

  return {
    createGitHubIssue,
    updateItem
  };
};
