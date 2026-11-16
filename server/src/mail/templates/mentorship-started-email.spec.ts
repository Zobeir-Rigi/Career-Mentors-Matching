import {
  buildMentorshipStartedEmail,
  type MentorshipStartedEmailInput,
} from './mentorship-started-email';

const input: MentorshipStartedEmailInput = {
  recipientFullName: ' Casey Morgan ',
  counterpartFullName: ' Amina Patel ',
  dashboardUrl: 'https://example.com/mentee/dashboard',
};

describe('buildMentorshipStartedEmail', () => {
  it('confirms the mentorship is active and trims both names', () => {
    const email = buildMentorshipStartedEmail(input);

    expect(email.subject).toBe('Your CYF mentorship is now active');
    expect(email.html).toContain('Hi Casey Morgan,');
    expect(email.html).toContain(
      'You and Amina Patel have both agreed to continue.',
    );
    expect(email.html).toContain('Your mentorship is now active.');
    expect(email.html).toContain(
      'You can view your mentorship in your dashboard.',
    );
  });

  it('displays names as text rather than HTML', () => {
    const email = buildMentorshipStartedEmail({
      ...input,
      recipientFullName: '<Casey & "Morgan">',
      counterpartFullName: "Amina O'Connor <Mentor>",
    });

    expect(email.html).toContain('Hi &lt;Casey &amp; &quot;Morgan&quot;&gt;,');
    expect(email.html).toContain('Amina O&#39;Connor &lt;Mentor&gt;');
    expect(email.html).not.toContain('<Mentor>');
  });

  it('uses the supplied dashboard URL and escapes its query separator', () => {
    const email = buildMentorshipStartedEmail({
      ...input,
      dashboardUrl: 'https://example.com/dashboard?tab=matches&view=active',
    });

    expect(email.html).toContain(
      'href="https://example.com/dashboard?tab=matches&amp;view=active"',
    );
  });
});
