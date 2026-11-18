# Mentorship email work: handoff to the Mac

Updated: 18 November 2026.

## Start here in a new conversation

Open this repository on `feat/mentorship-email-updates` and ask:

> Read `docs/mentorship-email-handoff.md`, check the current branch and files,
> and help me continue Task 3. Explain each small step so I can learn. First
> review the email inventory and Monoco's template conventions with me; do not
> implement the remaining work automatically.

This note supplies the project context to a new conversation. Do not rely on
the assistant remembering the previous conversation across computers.

## Which repository and branch?

There are two separate repositories:

| Repository                            | Purpose                                                                           | Relevant branch                                      |
| ------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `Zobeir-Rigi/Career-Mentors-Matching` | Original application; implement and test the requested email additions here first | `feat/mentorship-email-updates`                      |
| `CodeYourFuture/monoco`               | Production destination in the CYF Portal                                          | `feat/mentor-matching-emails` was created for Task 3 |

This email branch starts from `develop` at `8840752`. Completed checkpoints
include `ec91530` (proposal expiry emails and guarded mentor acceptance) and
`7bc236a` (mentorship-started notifications). This checkpoint adds
**Notify both participants when mentorship ends**; use `git log` for its hash.

The earlier scoring decoupling, threshold 70 and `openToInPerson` changes are
on a separate original-repository branch, ending at `9fe8261`:

```text
102-be-adjust-the-scoring-engine-about-location-open-to-in-person-remove-patch-service-of-your-goals-in-dashboard-threshold-70-decouple-the-algo-from-prisma
```

This email branch still uses `openToRemote` in its Prisma schema. Do not bring
unrelated scoring or profile changes into this branch. Regenerate Prisma after
switching branches to prevent generated types from the other schema causing
misleading TypeScript errors.

## Before leaving the current computer

The checkpoint was committed locally. Push this branch, including this note's
commit, before trying to clone it on the Mac. From the repository root:

```bash
git branch --show-current
git status --short --branch
git push -u origin feat/mentorship-email-updates
```

The branch should be `feat/mentorship-email-updates`. Check that any new work
has been committed. Git transfers committed files; it does not transfer ignored
environment files, local databases, installed dependencies or uncommitted work.

If you need your existing development settings or demo database, transfer them
separately through a private, secure method. Do not commit secrets or database
exports. The email work can continue with fresh local settings and a new test
database; copying the old database is optional.

## Set up the new Mac

Install Git, Node.js 22 (22.22 or later within that major version), npm, your
editor and Docker Desktop. Start Docker Desktop when database tests are needed.
Authenticate Git with a GitHub account that can access the repositories. The
HTTPS clone below can use GitHub's credential manager or token authentication;
an SSH remote instead needs an SSH key configured on the new Mac.

### Clone and prepare the backend

```bash
git clone --branch feat/mentorship-email-updates https://github.com/Zobeir-Rigi/Career-Mentors-Matching.git
cd Career-Mentors-Matching
git status --short --branch
git log -3 --oneline
cd server
cp .env.example .env
cp .env.test.example .env.test
```

Edit `.env`: replace the instructional `JWT_SECRET` placeholder with a real local
value, for example the output of `openssl rand -hex 32`. Keep
`EMAIL_PROVIDER=console` while developing. Use the example's local database URL;
AWS credentials are not required for the mocked email tests.

Then install the locked dependencies and generate the client for this branch:

```bash
npm ci
npm run prisma:generate
npm run typecheck
```

Do not copy Linux `node_modules` or generated Prisma files to the Mac.

### Run the focused tests first

From `server/`:

```bash
npm test -- --runInBand src/mail/templates/chemistry-proposal-expired-email.spec.ts src/mail/mail.service.spec.ts src/matching/services/matching-lifecycle.service.spec.ts src/mentors/mentors-engagement.service.spec.ts
```

These four suites use mocks and do not need a running PostgreSQL database or
actual email delivery. The checkpoint passed **47 tests** across these suites.

### Prepare fresh local databases for the full backend suite

From `server/`, with Docker Desktop running:

```bash
docker compose up -d
docker compose ps
npx prisma migrate deploy
docker compose exec postgres createdb -U postgres mentor_matching_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/mentor_matching_test npx prisma migrate deploy
npm test -- --runInBand
npm run lint
git status --short
```

Wait until PostgreSQL is healthy before running migrations. The `createdb`
command is only needed once on a fresh local database. `.env.test` points Jest
at `mentor_matching_test`; make sure an exported `DATABASE_URL` in your shell
does not override it. Only use these migration commands against your local
databases. `npm run lint` includes `--fix`, so review any changed files afterward.

At the checkpoint, the full backend suite passed **24 suites / 184 tests**;
typecheck and lint also passed. The Mac setup itself has not been tested yet.

The frontend is optional for the next template step. For browser checks later,
install it separately with `npm ci` in `client/`, configure its local environment
as needed, run `npm run dev`, and run `npm run start:dev` in `server/` in another
terminal. Avoid running Monoco and this frontend on port 5173 simultaneously.

## What we have completed

1. Added a pure template builder in
   `server/src/mail/templates/chemistry-proposal-expired-email.ts`, with its spec
   alongside it. Its inputs are `recipientFullName`, `counterpartFullName`,
   `recipientRole` and `dashboardUrl`. It returns `{ subject, html }`, escapes
   interpolated HTML and provides different next steps for mentors and mentees.
2. Added `sendChemistryProposalExpiredEmail` to `server/src/mail/mail.service.ts`
   and tests in `mail.service.spec.ts`. MailService supplies the role's dashboard
   URL and handles delivery through the existing console/SES mechanism.
3. Updated `processExpiredChemistryProposals` in
   `server/src/matching/services/matching-lifecycle.service.ts`, with tests in
   its spec. It sends to both people only when its conditional database update
   actually expires the pending proposal. One delivery failure does not prevent
   attempting the other recipient's email.
4. Updated `confirm` in `server/src/mentors/mentors-engagement.service.ts`, with
   tests in its spec. It updates only a still-`CHEMISTRY_PENDING` match and checks
   the affected-row count. If expiry has already changed the status, acceptance
   cannot overwrite it or send an acceptance email. Tests also cover overlapping
   acceptance attempts and already expired/confirmed proposals.
5. Added `mentorship-started-email.ts`, its template tests, and MailService's
   `sendMentorshipStartedEmail` and `notifyMentorshipStarted` methods. Both
   engagement services notify both participants only after the activation
   transaction commits and its guarded update reports `count: 1`.
6. Added `mentorship-ended-email.ts`, its template tests, and MailService's
   `sendMentorshipEndedEmail` and `notifyMentorshipEnded` methods. Both `end`
   methods conditionally update only an `ACTIVE` match to `COMPLETED`, then
   notify both participants only when that request reports `count: 1`.
   Tests cover both delivery roles, console mode, failed deliveries, repeated
   and overlapping requests, invalid statuses, ownership and database errors.

The started and ended templates take `recipientFullName`,
`counterpartFullName` and `dashboardUrl`, and return `{ subject, html }`.
They share `escape-html.ts` with the proposal-expiry template. Notification
helpers catch each recipient's delivery failure separately, so both deliveries
are attempted. The existing MailModule wiring supports both engagement services.

Latest assistant-run checks: six mail/template/engagement suites passed
**93 tests**; backend typecheck, scoped ESLint and formatting checks passed.
Before requesting this checkpoint, the user reported that the tests passed
after being given the full backend verification commands. No new full-suite
test count was supplied.

The conditional database update is the key protection: checking the status in
an earlier read alone leaves time for another request to change it before the
write. The concurrency scenarios are covered with mocked database responses;
they are not live concurrent-database tests.

Email failures are logged. This work does not add a durable retry queue: a
failed delivery after the status changes is not automatically retried by the
expiry job or by repeated start/end requests.

## Agreed lifecycle and email behaviour

Keep the existing **seven-day** proposal expiry. The earlier suggestion of three
days was dropped after finding the existing rule. Expiry changes the match to
`DECLINED`, releases its capacity and lets the existing history handling show it
as a past match.

| Event                                                     | Current email behaviour on this branch                              |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| Mentee proposes a chemistry session (`CHEMISTRY_PENDING`) | Existing proposal email to mentor                                   |
| Mentor accepts (`CHEMISTRY_CONFIRMED`)                    | Existing acceptance email to mentee                                 |
| Mentor has not responded within seven days                | New expiry emails to both participants; completed                   |
| Scheduled check-in becomes due (`MATCH_PENDING`)          | Existing check-in emails to both                                    |
| Check-in response window expires                          | Existing match-expiry emails to both; separate from proposal expiry |
| Both agree to continue (`ACTIVE`)                         | New mentorship-started emails to both; completed                    |
| Either person ends an active mentorship (`COMPLETED`)     | New mentorship-ended emails to both; completed                      |

The application also has existing verification, password-reset, mentor-profile
receipt, mentor approval-decision, admin mentor-review and admin waiting-list
emails. Do not assume Monoco needs duplicates of authentication emails it
already owns; confirm which templates belong in the migration.

## Next small steps

1. Inventory the existing mentoring emails in MailService alongside the three
   extracted templates. Agree which profile/admin notifications also belong in
   Task 3, avoiding duplicates of authentication emails Monoco already owns.
2. Inspect Monoco's current instructions and its volunteer-confirmation email
   builder, content-block types and tests before choosing a template location.
3. Adapt the agreed templates to pure functions returning a subject and content
   blocks, with Deno tests. Keep database access and delivery outside them.
4. Document which lifecycle event invokes each template and what inputs it
   needs, including the new started/ended and seven-day proposal-expiry emails.
5. Run Monoco's required checks and prepare a Task 3-only PR. No Task 3
   templates have been ported into Monoco yet.

Use `recipientFullName` consistently. Supply `dashboardUrl` to pure templates
instead of hardcoding a deployment URL. No additional manual-decline emails,
deadline changes or broad email refactor have been agreed.

## Monoco migration context

Tasks 1 and 2 have been ported, pushed and submitted as separate PRs according
to the previous conversation. Check their current review/merge status on GitHub
before choosing a new base; do not assume they have merged.

| Task                                       | Branch                            | Known checkpoint            |
| ------------------------------------------ | --------------------------------- | --------------------------- |
| 1: scoring engine and Deno tests           | `feat/mentor-matching-scoring`    | `bd2aa396`, PR #1045         |
| 2: pure candidate selection and Deno tests | `feat/mentor-matching-candidates` | `6ec608fe`, PR #1046, based on Task 1 |

Both review updates were pushed. Task 1 now uses Portal `locationId` inputs,
scores empty availability as zero, documents MIX as matching only MIX, and
returns unrounded final scores. Task 2 carries those changes and tests raw-score
ranking and thresholds; its capacity check and threshold documentation were
updated. Duncan also requested GitHub's explicit PR stack grouping; verify
whether it has been created. Do not assume either PR has merged.

Task 2 originally included Task 1 files when compared with `main`. Keep dependent
PRs based on the appropriate branch, or rebase after the dependency merges, so
each review shows one task.

For Task 3, inspect Monoco's current instructions and
`supabase/functions/process-volunteer-application/volunteer-confirmation-email.ts`
before porting. The tech lead wants pure functions returning a subject and
**content blocks**. Our original-app `{ subject, html }` builder demonstrates the
separation, but must be adapted to that Portal convention. Use Deno tests there;
do not copy Nest, Prisma or AWS SES delivery code into the template functions.
Portal backend code owns database access, scheduling and invoking the templates.

Each Monoco PR must cover one task, fill its PR template, and run `monoco lint`
and `monoco test`. Task 1 also explicitly requires `monoco test:edge`. Do not edit
`supabase/migrations/` or `supabase/tests/`.

Last reported Monoco Task 2 checks: `monoco test:edge` passed 908 tests with
272 steps; `monoco lint` passed. A previous full test run had WebKit launch
failures caused by missing Linux dependencies. That was not a passing full
suite; report the actual new Mac results rather than carrying over a green claim.

To prepare Monoco on the Mac, clone `CodeYourFuture/monoco`, check out the
intended branch and follow its current README: `./tools/monoco install`,
`monoco init`, `monoco server`, then `monoco doctor`. Its environment files and
Supabase database also need fresh local setup; they do not arrive through Git.
Use the documented `http://127.0.0.1:5173` origin for its local app.

## How we want to work together

The user wants to learn by doing, with clear explanations and exact file/method
names. Explain one small step, let the user edit when they want to, then review
and test. Implement code when explicitly asked. Keep each checkpoint focused and
do not automatically merge, push or change unrelated features.
