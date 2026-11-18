import { escapeHtml } from './escape-html';

export interface MentorshipEndedEmailInput {
  recipientFullName: string;
  counterpartFullName: string;
  dashboardUrl: string;
}

export function buildMentorshipEndedEmail({
  recipientFullName,
  counterpartFullName,
  dashboardUrl,
}: MentorshipEndedEmailInput): {
  subject: string;
  html: string;
} {
  const recipientName = escapeHtml(recipientFullName.trim());
  const counterpartName = escapeHtml(counterpartFullName.trim());
  const dashboardLink = escapeHtml(dashboardUrl);

  return {
    subject: 'Your CYF mentorship has ended',
    html: `
      <h1>Your mentorship has ended</h1>
      <p>Hi ${recipientName},</p>
      <p>Your mentorship with ${counterpartName} has ended.</p>
      <p>Thank you for taking part in the CYF mentoring programme.</p>
      <p>You can view your mentorship in your dashboard.</p>
      <p>
        <a href="${dashboardLink}">Open your dashboard</a>
      </p>
    `,
  };
}
