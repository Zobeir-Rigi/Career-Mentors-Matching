export interface ChemistryProposalExpiredEmailInput {
  recipientFullName: string;
  counterpartFullName: string;
  recipientRole: 'mentor' | 'mentee';
  dashboardUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildChemistryProposalExpiredEmail({
  recipientFullName,
  counterpartFullName,
  recipientRole,
  dashboardUrl,
}: ChemistryProposalExpiredEmailInput): {
  subject: string;
  html: string;
} {
  const recipientName = escapeHtml(recipientFullName.trim());
  const counterpartName = escapeHtml(counterpartFullName.trim());
  const dashboardLink = escapeHtml(dashboardUrl);

  const nextStep =
    recipientRole === 'mentee'
      ? 'You can request another mentor match from your dashboard.'
      : 'The mentoring place reserved for this proposal is available again.';

  return {
    subject: 'Your CYF chemistry proposal has expired',
    html: `
      <h1>Your chemistry proposal has expired</h1>
      <p>Hi ${recipientName},</p>
      <p>
        The chemistry proposal with ${counterpartName} has expired
        because no mentor response was received within seven days.
      </p>
      <p>${nextStep}</p>
      <p>
        <a href="${dashboardLink}">Open your dashboard</a>
      </p>
    `,
  };
}
