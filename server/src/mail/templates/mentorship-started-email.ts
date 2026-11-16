import { escapeHtml } from './escape-html';

export interface MentorshipStartedEmailInput {
  recipientFullName: string;
  counterpartFullName: string;
  dashboardUrl: string;
}

export function buildMentorshipStartedEmail({
  recipientFullName,
  counterpartFullName,
  dashboardUrl,
}: MentorshipStartedEmailInput): {
  subject: string;
  html: string;
} {
  const recipientName = escapeHtml(recipientFullName.trim());
  const counterpartName = escapeHtml(counterpartFullName.trim());
  const dashboardLink = escapeHtml(dashboardUrl);

  return {
    subject: 'Your CYF mentorship is now active',
    html: `
      <h1>Your mentorship is now active</h1>
      <p>Hi ${recipientName},</p>
      <p>
        You and ${counterpartName} have both agreed to continue.
        Your mentorship is now active.
      </p>
      <p>
        You can view your mentorship in your dashboard.
      </p>
      <p>
        <a href="${dashboardLink}">Open your dashboard</a>
      </p>
    `,
  };
}
