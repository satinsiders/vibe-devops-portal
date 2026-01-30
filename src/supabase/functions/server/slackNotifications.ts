/**
 * Send a Slack notification via webhook
 */
export async function sendSlackNotification(params: SlackNotificationParams): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  
  console.log('🔔 Preparing to send Slack notification:', params);
  
  if (!webhookUrl) {
    console.warn('⚠️  SLACK_WEBHOOK_URL not configured, skipping notification');
    return;
  }

  const message = formatSlackMessage(params);
  console.log('📝 Formatted Slack message:', JSON.stringify(message, null, 2));

  try {
    console.log('📤 Sending to Slack webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to send Slack notification. Status:', response.status, 'Response:', errorText);
    } else {
      console.log('✅ Slack notification sent successfully to webhook');
    }
  } catch (error) {
    console.error('❌ Error sending Slack notification:', error);
  }
}

/**
 * Format Slack message with rich formatting
 */
function formatSlackMessage(params: SlackNotificationParams) {
  const { event, developer, taskTitle, taskId, pmName, changes } = params;

  // Map developer names to Slack handles
  const devHandle = `@${developer}`;
  
  let text = '';
  let emoji = '';
  let color = '#2563eb'; // Default blue

  switch (event) {
    case 'task_assigned':
      emoji = '✨';
      color = '#10b981'; // Green
      text = `${emoji} *새 작업 할당됨* ${devHandle}\n\n` +
             `*작업:* ${taskTitle || '제목 없음'}\n` +
             `*할당자:* ${pmName || '김재연'}\n\n` +
             `작업이 할당되었습니다. 워크스페이스에서 확인하세요!`;
      break;

    case 'task_reassigned':
      emoji = '🔄';
      color = '#f59e0b'; // Orange
      text = `${emoji} *작업 재할당됨* ${devHandle}\n\n` +
             `*작업:* ${taskTitle || '제목 없음'}\n` +
             `*할당자:* ${pmName || '김재연'}\n\n` +
             `작업이 재할당되었습니다.`;
      break;

    case 'task_edited':
      emoji = '📝';
      color = '#3b82f6'; // Blue
      text = `${emoji} *작업 수정됨* ${devHandle}\n\n` +
             `*작업:* ${taskTitle || '제목 없음'}\n` +
             `*수정자:* ${pmName || '김재연'}\n` +
             (changes ? `*변경사항:* ${changes}\n\n` : '\n') +
             `작업 내용이 수정되었습니다. 확인해주세요.`;
      break;

    case 'pr_approved':
      emoji = '✅';
      color = '#10b981'; // Green
      text = `${emoji} *PR 승인됨!* ${devHandle}\n\n` +
             `*작업:* ${taskTitle || '제목 없음'}\n` +
             `*승인자:* ${pmName || '김재연'}\n\n` +
             `축하합니다! PR이 승인되어 작업이 완료되었습니다! 🎉`;
      break;

    case 'pr_submitted':
      emoji = '🔍';
      color = '#8b5cf6'; // Purple
      text = `${emoji} *PR 리뷰 요청* @김재연\n\n` +
             `*작업:* ${taskTitle || '제목 없음'}\n` +
             `*개발자:* ${developer}\n` +
             `*PR 링크:* 제출됨\n\n` +
             `리뷰를 기다리고 있습니다.`;
      break;

    case 'task_requested':
      emoji = '💬';
      color = '#ec4899'; // Pink
      text = `${emoji} *새 작업 요청* @김재연\n\n` +
             `*요청자:* ${developer}\n` +
             `*메시지:* ${taskTitle || '작업을 요청했습니다'}\n\n` +
             `개발자가 새 작업을 요청했습니다.`;
      break;

    default:
      text = `Notification: ${event}`;
  }

  return {
    attachments: [
      {
        color: color,
        text: text,
        mrkdwn_in: ['text'],
        footer: 'Vibe Dev Ops Portal',
        footer_icon: 'https://slack.com/favicon.ico',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
}