/**
 * Slack notification system - client-side proxy to server
 * All Slack notifications are sent via the server to avoid CORS issues
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

export type SlackNotificationEvent =
  | 'task_assigned'
  | 'task_reassigned'
  | 'task_edited'
  | 'pr_approved'
  | 'pr_submitted'
  | 'task_requested';

interface SlackNotificationParams {
  event: SlackNotificationEvent;
  developer: string;
  taskTitle?: string;
  taskId?: string;
  pmName?: string;
  changes?: string;
}

/**
 * Send a Slack notification via server endpoint
 */
export async function sendSlackNotification(params: SlackNotificationParams): Promise<void> {
  try {
    console.log('📤 Sending Slack notification request to server:', params);
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-7839915e/slack-notify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to send Slack notification. Status:', response.status, 'Response:', errorText);
    } else {
      console.log('✅ Slack notification request successful');
    }
  } catch (error) {
    console.error('❌ Error sending Slack notification:', error);
  }
}
