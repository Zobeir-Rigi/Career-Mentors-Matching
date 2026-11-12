# Optional in-person mentoring

Mentorship is remote by default. `openToInPerson` records willingness to meet
in person as an optional extra. It replaces the old remote preference throughout
the current profile API, UI and matching inputs.

## Changes to review in order

1. **Storage:** `server/prisma/schema.prisma` renames the mentor and mentee profile
   fields. Migration `20261110120000_replace_remote_with_in_person_preference`
   renames the existing columns and resets all current profile answers to false.
   Remote willingness cannot establish in-person willingness. The default remains
   false and users can opt in through their profile form. Old migration files and
   historical JSON snapshots are not rewritten.
2. **Profile APIs:** mentee and mentor DTOs, service types and response mappings
   use the new field. Updates preserve an explicit false value, allowing opt-out.
   The mentor PATCH DTO inherits the renamed field from its create DTO.
3. **Matching:** scoring inputs and adapters use `openToInPerson`. Location scores
   1 only when both people opt in and both have the same non-empty region value;
   otherwise it scores 0. It is not an eligibility restriction. With the existing
   weights totalling 100, location contributes 10 points and remote-only pairs
   can still pass threshold 70. New match snapshots record the new field.
4. **Frontend:** profile context, API types, both profile forms and recommendation
   cards use the new field. Forms say “Open to optional in-person meetings” and
   explain that mentorship is remote by default. Defaults and missing responses
   display as false. Checked and unchecked values are included when saving.
5. **Fixtures:** demo profiles now specify in-person willingness explicitly.
   Location tests cover both opt-ins, mismatched regions and missing regions.
   A service test proves that a remote-only pair can still score 70 and qualify.
   Profile service tests check saving true and false, opting out and preserving
   the preference when another field changes.

## Applying the database change

The migration has been applied to the local application database.
`npx prisma migrate status` confirmed that the database schema is up to date.
The SQL was also verified using session-local temporary tables in the local
test database: both columns were renamed, old values became false, new rows
defaulted to false, opt-in/opt-out worked, and snapshot contents were preserved.

For another environment, review the migration before applying: its reset
intentionally replaces existing profile answers. After selecting the intended
database, run from `server/`:

```bash
npx prisma migrate deploy
npm run prisma:generate
```

`migrate deploy` applies all pending migrations for that database. Do not use the
demo seed as a way to apply this feature; it changes other data as well.
Restart the backend after applying the migration. Frontend and backend must use
the new contract together; old clients sending `openToRemote` need updating.

Manual browser checks confirmed that both mentor and mentee profiles save
opt-in and opt-out values after reloading. With the existing weights totalling
100, location contributes 10 points only when both people opt in and share the
same region. Different regions or either person opting out award no location
points.

## Monoco handoff

- Supply genuine `openToInPerson` booleans for both profiles. Do not rename or
  invert old remote answers to infer them.
- Configure the minimum matching score as 70, including equal scores.
- Preserve the optional location contribution and keep remote-only pairs eligible.
- Use the Portal team's database and API conventions; this Prisma migration is
  for this application and should not be copied into Monoco.
- Jest verification here does not replace the required Deno conversion and
  `monoco test:edge`, lint and full tests in Monoco.
