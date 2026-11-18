import {
  buildMentorshipEndedEmail,
  type MentorshipEndedEmailInput,
} from './mentorship-ended-email';

const input: MentorshipEndedEmailInput = {
  recipientFullName: ' Casey Morgan ',
  counterpartFullName: ' Amina Patel ',
  dashboardUrl: 'https://example.com/mentee/dashboard',
};

describe('buildMentorshipEndedEmail', () => {
  it('confirms the mentorship has ended and trims both names', () => {
    const email = buildMentorshipEndedEmail(input);

    expect(email.subject).toBe('Your CYF mentorship has ended');
    expect(email.html).toContain('<h1>Your mentorship has ended</h1>');
    expect(email.html).toContain('Hi Casey Morgan,');
    expect(email.html).toContain('Your mentorship with Amina Patel has ended.');
    expect(email.html).toContain(
      'You can view your mentorship in your dashboard.',
    );
  });

  it('also addresses the mentor when the participants are reversed', () => {
    const email = buildMentorshipEndedEmail({
      recipientFullName: 'Amina Patel',
      counterpartFullName: 'Casey Morgan',
      dashboardUrl: 'https://example.com/mentor/dashboard',
    });

    expect(email.subject).toBe('Your CYF mentorship has ended');
    expect(email.html).toContain('Hi Amina Patel,');
    expect(email.html).toContain(
      'Your mentorship with Casey Morgan has ended.',
    );
    expect(email.html).toContain('href="https://example.com/mentor/dashboard"');
  });

  it('displays names as text rather than HTML', () => {
    const email = buildMentorshipEndedEmail({
      ...input,
      recipientFullName: '<Casey & "Morgan">',
      counterpartFullName: "Amina O'Connor <Mentor>",
    });

    expect(email.html).toContain('Hi &lt;Casey &amp; &quot;Morgan&quot;&gt;,');
    expect(email.html).toContain('Amina O&#39;Connor &lt;Mentor&gt;');
    expect(email.html).not.toContain('<Casey');
    expect(email.html).not.toContain('<Mentor>');
  });

  it('uses the supplied dashboard URL and escapes its query separator', () => {
    const email = buildMentorshipEndedEmail({
      ...input,
      dashboardUrl: 'https://example.com/dashboard?tab=matches&view=past',
    });

    expect(email.html).toContain(
      'href="https://example.com/dashboard?tab=matches&amp;view=past"',
    );
  });
});
