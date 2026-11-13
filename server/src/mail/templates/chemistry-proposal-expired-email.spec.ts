import {
  buildChemistryProposalExpiredEmail,
  type ChemistryProposalExpiredEmailInput,
} from './chemistry-proposal-expired-email';

const input: ChemistryProposalExpiredEmailInput = {
  recipientFullName: ' Casey Morgan ',
  counterpartFullName: ' Amina Patel ',
  recipientRole: 'mentee',
  dashboardUrl: 'https://example.com/mentee/dashboard',
};

describe('buildChemistryProposalExpiredEmail', () => {
  it('explains expiry and tells the mentee how to request another match', () => {
    const email = buildChemistryProposalExpiredEmail(input);

    expect(email.subject).toBe('Your CYF chemistry proposal has expired');
    expect(email.html).toContain('Hi Casey Morgan,');
    expect(email.html).toContain('proposal with Amina Patel');
    expect(email.html).toContain('within seven days');
    expect(email.html).toContain(
      'You can request another mentor match from your dashboard.',
    );
  });

  it('tells the mentor that the reserved place is available again', () => {
    const email = buildChemistryProposalExpiredEmail({
      ...input,
      recipientFullName: 'Amina Patel',
      counterpartFullName: 'Casey Morgan',
      recipientRole: 'mentor',
      dashboardUrl: 'https://example.com/mentor/dashboard',
    });

    expect(email.html).toContain('Hi Amina Patel,');
    expect(email.html).toContain('proposal with Casey Morgan');
    expect(email.html).toContain(
      'The mentoring place reserved for this proposal is available again.',
    );
    expect(email.html).not.toContain('request another mentor match');
    expect(email.html).toContain('href="https://example.com/mentor/dashboard"');
  });

  it('displays names as text rather than HTML', () => {
    const email = buildChemistryProposalExpiredEmail({
      ...input,
      recipientFullName: '<Casey & "Morgan">',
      counterpartFullName: "Amina O'Connor <Mentor>",
    });

    expect(email.html).toContain('Hi &lt;Casey &amp; &quot;Morgan&quot;&gt;,');
    expect(email.html).toContain('Amina O&#39;Connor &lt;Mentor&gt;');
    expect(email.html).not.toContain('<Mentor>');
  });

  it('uses the supplied dashboard URL and escapes its query separator', () => {
    const email = buildChemistryProposalExpiredEmail({
      ...input,
      dashboardUrl: 'https://example.com/dashboard?tab=matches&view=past',
    });

    expect(email.html).toContain(
      'href="https://example.com/dashboard?tab=matches&amp;view=past"',
    );
  });
});
