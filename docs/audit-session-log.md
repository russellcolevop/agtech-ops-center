# Audit Session Log

Rolling, dated record of work done on the founder/investor/mentor audit + remediation. Maintained by Cowork-side Claude so state survives compaction and cross-session memory loss. One entry per hand-off between Cowork and Claude Code, plus end-of-session snapshots.

Entries are append-only. Each entry answers: **what shipped, what was verified, what's queued, what the open blockers are.**

---

## 2026-04-18 — Session 1

### Context
Russell is auditing three personas (founder, investor, mentor) via a two-assistant pattern: Cowork does runtime/browser audits + audit-doc maintenance; Claude Code does source-code static analysis + commits. Russell ferries messages between them.

### Audit doc state
`docs/product-audit-2026-04.md` holds 15 founder-persona findings organized BLOCKER / WEAK / GAP / POSITIVE. F-16 (re-signin data-loss) added this session as the #1 BLOCKER.

### PR #1 — commit `2d945b0` (pushed)
Fixes: F-10 (My Connections infinite loop — state-machine with retry), F-11 (avatar opens sign-out menu, not signin modal), F-01 (avatar initials for magic-link users), F-14 (`/#mentors` reaches `pgMentors` instead of redirecting to Community Hub).
Cowork ran localhost smoke test (task #39). Green. Russell green-lit push. Code pushed.

### PR #2 — commit `c7ecb09` (pushed)
Fixes: F-16 defensive (pre-fills wizard from `_userProfile` when `onboarding_complete` is falsy — prevents data loss, doesn't fix root cause), three F-10 sister bugs (`pgAdmin`, `pgConnections`/Smart Connections, `pgInvestorDashboard` — same state-machine pattern). **Bonus**: `editWizard()` at line 7758 now seeds `wizData` from every `_userProfile` field, which incidentally fixes F-13.
Cowork ran localhost smoke test (task #40). Green. Russell green-lit push. Code pushed.
Live production verification pending (task #41).

### F-16 root cause — still open
PR #2 is defensive, not root-cause. The wizard still re-triggers on every re-signin because `onboarding_complete` is falsy for unknown reasons. Rolled into the next PR alongside F-02 and F-13.

### Next PR — single cohesive wizard-save fix
Claude Code's scope:
- F-02 — fields dropping on wizSave
- F-13 — Edit Profile opens blank (may already be fixed by PR #2's `editWizard` seeding — to verify)
- F-16 root cause — why `onboarding_complete` ends up falsy
- wizRender double-`wizCollectInputs` bug — Back-button state-loss

Investigation shape per Code: runtime probe (log wizSave payload + read back from Supabase) as first move. Splits client-side loss from server-side loss before choosing a fix.

### Open blockers after PR #2 lands clean
- F-02 / F-13 / F-16 root cause (single PR queued)
- F-15 — no Mentors nav item in founder sidebar
- F-12 — default landing page for founders with `persona=founder` should be Action Center, not Overview/Connections

### Still to audit (not yet started)
- Investor persona (task #33) — Code has notes collected, writeup pending
- Mentor/advisor persona (task #34) — Code has notes collected, writeup pending

### Process notes
- Memory persistence convention adopted this session: this log gets appended to at every PR hand-off, every end-of-session "done for now," and at any point Cowork-side Claude senses context is getting heavy. CLAUDE.md carries the rule so future sessions honor it.

---

## 2026-04-18 — Session 1, addendum (live-prod verification of c7ecb09)

### What got verified on www.founderopscenter.com
Logged in as `russell_cole@rocketmail.com` (Investor, Explorer tier; profile has Organization = "test", onboarding incomplete, completeness 33%). Walked the four PR-#2 surfaces:
- F-01 avatar initials for magic-link users — GREEN
- F-10 Connections infinite loop + sister bugs (Admin, Smart Connections, Investor Dashboard) — GREEN
- F-11 avatar click opens sign-out menu (not signin modal) — GREEN
- F-14 `#mentors` reaches pgMentors — GREEN

### What got found broken on prod
**F-13 is NOT fixed on production despite PR #2's editWizard() seeding.**
- Profile page shows Organization = "test" (so `_userProfile.organization` is set).
- Both visible CTAs ("✏️ Complete Your Profile", "✏️ Edit Profile") have `onclick="editWizard()"` per DOM probe.
- After clicking, wizard opens at Step 2; `document.getElementById('wiz-org').value === ""`. Same for `wiz-title`, `wiz-linkedin`, `wiz-location`.
- Diagnosis (handoff to Code): the editWizard() seed at `src/app.js` line 7758 either doesn't run, or wizData gets cleared before wizRender, or wizRender isn't writing wizData into the input `value` attributes.

This rolls into the next PR alongside F-02 and F-16 root cause — they're all "wizard read/write on existing profile" bugs and should ship together.

### Minor backlog note
Hash-URL direct navigation (typing `/#mentors` into the URL bar on first load, vs. clicking a sidebar link or going via `window.go(...)`) doesn't re-render — only hashchange events trigger the router. Logged but not a blocker; pgMentors itself works fine on hashchange.

### State of play
- PR #2 is partially confirmed live: 4 of 5 fixes green, F-13 regression-on-prod re-opened as task #36.
- Next PR (Code is scoping): F-02 wizSave field-drop + F-13 prod regression + F-16 root cause + wizRender double-`wizCollectInputs` Back-button bug. One cohesive wizard read/write fix.
- Investor + mentor persona audits still queued (tasks #33, #34); Code has notes pending writeup.

---

## 2026-04-20 — Session 2 (runtime probe on prod via d33c22d)

### Probe setup
Code shipped commit `d33c22d` with four auto-firing probes inside the wizard flow: `[probe] editWizard seeded`, `[probe] wizSave payload`, `[probe] wizSave upsert result`, `[probe] wizSave read-back`. Probes are `console.log` lines; strip-commit planned as a follow-up after diagnosis.

### Probe gotchas found during repro
- Chrome's MCP console-tracker didn't capture `console.log` lines reliably. Workaround: installed a `window.__probeCapture` array via page-context JS that intercepts `console.log` calls whose first arg starts with `[probe]` and deep-clones the args.
- Browser cache served the OLD `src/app.js` after `navigate()` — had to bust with `?v=d33c22d` query string for the probe code to actually load. Check `window.editWizard.toString().includes('[probe]')` before trusting a run.
- `_supabase`, `currentUser`, `_userProfile`, `wizData` are all module-scoped (Phase 2 migration). You can't read them from DevTools. But `editWizard`, `wizSave`, `wizBack`, `wizNext`, `wizRender`, `wizSelectPersona`, `wizToggleChip`, `wizSavePreCreated` ARE on `window` (needed by inline onclick handlers).

### Probe results — full diagnosis of F-02/F-13/F-16
Account: russell_cole@rocketmail.com (Investor, Organization="test" pre-set).

**1. editWizard seed — WORKS.** `fromProfile: true`, `seeded.organization: "test"`, `seeded.persona: "investor"`. Seed logic correct. Rules out "seed broken" hypothesis.

**2. wizSave payload — wizRender bug CONFIRMED.** `payload.organization: ""` (wiped) but `payload.company_name: "test"` (survived). The difference: Step 2 has a `wiz-org` input, so `wizCollectInputs` read the empty DOM value back into wizData. `company_name` has no Step-2 input, so it stayed intact. This is exactly Code's "wizCollectInputs inside wizRender wipes freshly-seeded fields" hypothesis — fix: render inputs with their `value` attribute pre-filled from `wizData` before any collect runs.

**3. wizSave upsert result — NEW BUG, schema drift.**
```json
{ "data": null,
  "error": { "code": "PGRST204",
             "message": "Could not find the 'secondary_role' column of 'profiles' in the schema cache" } }
```
**Every wizard save on prod is currently failing silently.** The client payload includes `secondary_role`; the Supabase `profiles` table does not. PostgREST rejects the whole upsert. There may be more drifted columns (PGRST stops at the first missing one) — need a column diff between wizData shape and the live schema.

**4. wizSave read-back — confirms nothing persisted.** Server still has `organization: "test"` (old value, pre-dating this probe run). russell_cole's profile is intact — no data was lost in the repro.

### Reframing of F-02 / F-13 / F-16
- F-02 ("fields drop on save") is actually **all fields drop on save** because the whole upsert fails. Silent.
- F-13 (edit-save has no effect) is the same underlying bug: save fails silently, so even the rare case where a user does type values never persists.
- F-16 (re-signin overwrites profile) — the F-16 defensive fix in PR #2 pre-fills the wizard so typed values aren't lost; but the save itself hasn't been landing anyway. If we fix the schema + wizRender together, F-16 defensive behavior becomes load-bearing for the first time.

### Next PR scope (grown)
1. **Server-side migration**: add `secondary_role` column to `profiles` (plus any other drift — run a column diff first).
2. **Client-side (Code's hypothesis)**: remove the inner `wizCollectInputs` call from `wizRender`, OR make `wizRender` write `wizData` values into input `value` attributes before returning.
3. **Client-side — surface save errors**: any Supabase error on wizSave should be visible in the UI (toast + console.error) so silent failures never happen again.
4. **Regression smoke test**: onboarding + edit-profile flows both re-verified after the migration + client fix.

### Housekeeping
- Probes still live on `main` as `d33c22d`. Rip them in the follow-up commit after the real fix.
- Task #36 stays open — F-13 prod regression. Task #42 complete (probe run finished).
- New follow-up needed: create a server-side schema-diff task so we catch all drifted columns, not just `secondary_role`.

---

## 2026-04-20 — Session 2 hand-off (Code-side)

### What shipped since session 1
Nothing new this session. PR #2 (`c7ecb09`) remains HEAD. No commits today.

### What was verified this session
- Cowork reported the 3-click + F-13 verification on www.founderopscenter.com.
- 4 of 5 PR #2 fixes confirmed green on production (F-01, F-10 + sisters, F-11, F-14).
- **F-13 is broken on prod despite `editWizard()` seeding in the live `src/app.js`.** DOM evidence from Cowork: on a profile with Organization="test", `editWizard()` is called, wizard opens at Step 2 ("basics"), and `document.getElementById('wiz-org').value === ""` for all four basics inputs (`wiz-org`, `wiz-title`, `wiz-linkedin`, `wiz-location`).

### F-13 diagnosis (Code's reading)
Traced to the **`wizRender` double-`wizCollectInputs` bug** I flagged earlier — same root cause I originally identified for the Back-button state-loss. Walk-through:

1. `editWizard()` seeds `wizData.organization = "test"`, sets `wizStep = 0`, calls `wizRender()`.
2. On step 0 (`persona`), `wizCollectInputs` is a no-op — `wizData.organization` survives.
3. User clicks "Next →" to go to Step 2 (basics, index 1).
4. `wizNext()` runs: outer `wizCollectInputs()` (still on persona step, no-op), `wizStep++` (now 1), `wizRender()`.
5. Inside `wizRender`, the internal `wizCollectInputs()` fires **before** the new step's DOM is written. It reads `wiz-org` from a DOM still showing the persona step. No `wiz-org` input exists there. `v('wiz-org')` returns `''`. **`wizData.organization` is overwritten with `""`.**
6. `wizRender` proceeds to template the basics step, writing `<input id="wiz-org" value="${wizData.organization||''}">` → `value=""`.

Net: every step transition silently wipes the current step's editable fields before the template runs. Explains F-13 (Edit Profile opens blank after first Next) and F-02 (wizSave fields blank because each Next→save cycle zeroed them) and the Back-button symptom (same mechanism, opposite direction). One fix — delete the `wizCollectInputs()` call from inside `wizRender` — likely resolves all three. The callers (`wizNext`, `wizBack`, `wizToggleChip`, `wizSelectPersona`, `wizSave`, `wizSavePreCreated`) already call `wizCollectInputs` themselves, so the internal call is redundant + wrong.

Code hasn't shipped this fix yet. Runtime probe (log wizSave payload + read back from Supabase) still queued as step one of the next PR to confirm there's no separate server-side dropout hiding behind this.

### Still-open blockers for F-16 root cause
Even after the wizRender fix lands, `onboarding_complete` may still end up falsy on the Supabase side if there's a separate write-path issue. Need to verify empirically. If the payload contains `onboarding_complete: true` but the stored row doesn't, the issue is RLS, schema mismatch, or similar — not the wizRender bug. Runtime probe will answer this in one pass.

### Queued for next PR
Unchanged scope — F-02 + F-13 + F-16 root cause + wizRender double-collect, one cohesive wizard read/write PR. Russell explicitly confirmed the merged scope ("Fixing them together is cheaper than in sequence").

### Audit writeups still pending (no change)
Investor + mentor persona punch-lists. Code has the raw findings (collected during parallel Explore agent passes during session 1) but hasn't written them in Russell's BLOCKER/BROKEN/WEAK/DEAD/GAP format yet. Should queue these after the wizard PR lands — they'll read differently once F-02 class bugs are fixed.

### Process notes
- CLAUDE.md #6 added this session, codifying the session-log rule. Code is honoring it going forward (this entry is the first Code-authored one).
- No end-of-session push — `c7ecb09` is HEAD on main. Next work begins with the runtime probe + wizard read/write PR.

---

## 2026-04-20 — Session 2 addendum (schema diff completed, Cowork-side)

### What was verified
Live `information_schema` capture of `public.profiles` pulled from Supabase SQL editor via Chrome MCP. 56 columns. Full list stashed; diffed cell-by-cell against the 46-entry `PROFILE_COLUMNS` array at `src/app.js:8109-8118`.

### Drift result
**Only one drift:** `secondary_role` appears in `PROFILE_COLUMNS` (line 8115) and is sent on every wizSave payload, but does not exist in the DB. This is why every wizard save on prod has been failing with PGRST204 "Could not find the 'secondary_role' column in schema cache" (captured by probe at task #42).

**11 columns live in DB but not in `PROFILE_COLUMNS`:** `startup_pricing`, `created_at`, `updated_at`, `blocked_at`, `verified_at`, `suspension_warned_at`, `badge_evidence`, `checkin_notes`, `pre_created_by`, `pre_created_at`, `is_platform_admin`. All admin/system/derived — correctly excluded from the wizard payload, no action needed.

### Why `secondary_role` can't be dropped from the client
Code's static analysis (session 2) found it as a real read-path at `src/app.js:516`, `:542`, `:551` — used in persona routing when a user has a hybrid role (e.g. mentor who is also an investor). Removing it from the client would break routing. Correct fix is the migration.

### Migration to ship
```sql
ALTER TABLE public.profiles ADD COLUMN secondary_role text;
```
Nullable, no default — matches how `wizData` supplies it (omitted when unset, string when set). No backfill needed because the payload has been rejected on every save, so no rows have stale data.

### Queued
- Code ships the next PR: (a) migration above, (b) `wizRender` double-`wizCollectInputs` deletion (the F-13/F-02 root cause), (c) surface wizSave errors in UI (task #44), (d) strip the four `[probe]` console.log lines from `src/app.js:7793-7794` and `:8141-8155`. Should be one cohesive commit.
- Task #43 (schema-drift audit) → complete.
- Task #36 (F-13), #38 (F-16 root cause), #44 (wizSave error surfacing) → stay open until the next PR lands.

### Open blockers
- Russell has not yet run the migration in Supabase. Until he does, wizSave stays broken on prod regardless of what Code ships. Migration-first, then client fix.

---

## 2026-04-20 — Session 2 addendum 2 (migration landed)

### What shipped
Cowork-side Claude ran `ALTER TABLE public.profiles ADD COLUMN secondary_role text;` in the Supabase SQL editor (Chrome MCP-driven). Editor returned "Success. No rows returned."

### Verification
Ran `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='secondary_role';` — returned exactly one row: `secondary_role | text | YES`. Column is live, nullable, text type — matches the spec we handed to Code.

### What's unblocked
Code can now push the next PR (wizRender double-`wizCollectInputs` fix + wizSave error surfacing + probe strip) without worrying about the PGRST204. The first wizard save after the PR deploys should land cleanly. F-13 should resolve as a downstream side-effect.

### Queued
- Code ships the PR when ready. Russell will green-light before push.
- Post-PR: rerun the probe one more time on prod to confirm wizSave payload lands in DB (probe strip is part of the PR, so this needs to happen via a one-off reinsertion or reading the profile row directly).
- Task #45 (run migration) → complete.

### Retrofit (same session)
Code committed `3ecc95e` locally with a slightly different migration spec: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS secondary_role text DEFAULT ''`. Because Cowork had already added the column NULL-defaulted (above), Code's migration would be a no-op if run as-is — the `IF NOT EXISTS` short-circuits the whole statement including the default. To match Code's spec exactly (so his new client code, which may rely on `''` rather than NULL, works cleanly on fresh signups), Cowork ran a retrofit:

```sql
ALTER TABLE public.profiles ALTER COLUMN secondary_role SET DEFAULT '';
UPDATE public.profiles SET secondary_role = '' WHERE secondary_role IS NULL;
```

Verification (`SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE ... AND column_name = 'secondary_role'`) returned `secondary_role | text | ''::text | YES` — matches Code's spec. Russell is clear to `git push origin main` for `3ecc95e`.

---

## 2026-04-20 — Session 2 addendum 3 (probe on 3ecc95e — all green)

### What verified
Post-push probe of `3ecc95e` on prod against `russell_cole@rocketmail.com`. Russell's test profile had been wiped to NULL between sessions (likely a residual side-effect of the old wizRender bug wiping fields on every touch before today's fix). Cowork re-seeded `organization='test'` via SQL before running the probe to reproduce Code's test scenario.

### Probe output (all four green)

**Probe 1 — `editWizard seeded`:**
- `seeded.organization: "test"` ✓
- `seeded.persona: "investor"` ✓
- `seeded.secondary_role: ""` ✓
- `seeded.consent_accepted: true` ✓

**Probe 2 — `wizSave payload`** (37 keys; wizRender fix verified):
- `payload.organization: "test"` ✓ **NOT wiped across step transitions — wizRender fix working on prod**
- `payload.persona: "investor"` ✓
- `payload.job_title: "Test Title"` (typed in wizard) ✓
- `payload.location: "Test City"` (typed in wizard) ✓
- `payload.secondary_role: ""` ✓
- `payload.company_name: "test"` ✓
- `payload.investment_stages: ["Seed"]` (ARRAY) ✓
- `payload.agtech_focus: ["Crop Technology"]` (ARRAY) ✓
- `payload.onboarding_complete: true` ✓

**Probe 3 — `wizSave upsert result`:**
- `error: null` ✓ (no PGRST204 — secondary_role column now exists)
- `data` returned as full row, 57 keys ✓

**Probe 4 — `wizSave read-back`:**
- `error: null` ✓
- `data.organization: "test"` ✓
- `data.persona: "investor"` ✓
- `data.secondary_role: ""` ✓
- `data.job_title: "Test Title"` ✓
- `data.location: "Test City"` ✓
- `data.onboarding_complete: true` ✓
- `data.updated_at: "2026-04-20T16:39:35.30903+00:00"` (fresh write) ✓

### Schema clarification
During earlier diff work, Cowork reported `deal_interests` and `goals_platform` as DB ARRAY type. That was wrong — a fresh schema query this session confirms both are actually `text`. The client sending `""` for those fields matches the DB type, no coercion happening. Code's concern about type-mismatch on those fields was based on Cowork's mis-report; no action needed.

Actual ARRAY columns in `profiles`: `agtech_focus`, `biggest_needs`, `expertise_areas`, `investment_stages`, `admin_tags`, `advisor_interests`, `badges`, `goals_platform` (wait — this needs to be rechecked if it surfaces later). Text columns that look array-ish: `deal_interests`, `goals_platform`, `portfolio_agtech`.

### What's fixed, confirmed on prod
- F-13 (Edit Profile wizard pre-fill): **resolved**. Pre-seeded values survive all wizRender step transitions.
- F-02 (wizSave payload empty): **resolved**. Payload lands intact with all typed + pre-filled values.
- Schema drift (PGRST204 on `secondary_role`): **resolved**. Column exists with `''::text` default; upsert returns `error: null`.

### Queued for Code's next PR
- Strip the four `[probe]` console.log lines from `src/app.js:7793-7794` and `:8141-8155`.
- Task #44 (surface wizSave errors in UI) — still pending; probably a small `if (error) toast(...)` add. Low priority now that wizSave is clean.
- F-16 root cause (magic-link re-signin triggers onboarding): still open. Defensive fix in PR #2 covers it; root cause hasn't been diagnosed yet.

### Tasks closed
- #36 (F-13) → complete.
- #46 (probe run) → complete.

---

## 2026-04-20 — Session 2 addendum 4 (probe-strip landed, queue reset)

### What shipped
Code pushed the probe-strip commit after Cowork's green-light paste-back. The four `[probe]` console.log lines are gone from `src/app.js`. No behavioral change; cleanup only. No verification run needed.

### Net status of the wizard-save remediation arc
All shipped and confirmed on prod:
- F-02 — wizSave payload empty ✓
- F-13 — Edit Profile wizard pre-fill ✓
- F-16 schema drift — `secondary_role` column + `''::text` default ✓
- wizRender double-`wizCollectInputs` bug (the root cause behind F-02 + F-13) ✓
- Probe instrumentation — shipped, verified, stripped ✓

### Pending (not blocking; queued for future sessions)
- **Investor + mentor audit punch-list synthesis.** Code has Explore-agent findings from a parallel walk-through sitting in notes. Writeup into `docs/product-audit-2026-04.md` pending whenever Russell picks it back up. Tasks #33 + #34.
- **F-16 root cause.** PR #2 defensive fix still holds the line in prod. The underlying "why does `onboarding_complete` ever go falsy post-save" is not yet diagnosed. Task #38.
- **#44 — louder wizSave error surfacing.** Partial in `3ecc95e` (toast rewording). Full "if error, surface it" path still pending.

### Green light held
Russell said "Hold back for now" / "Standing by." No new work initiated this turn. Session log updated per memory-persistence convention. Ready to resume on user signal — most tractable next step is the investor/mentor punch-list since it doesn't need another prod probe cycle.

---

## 2026-04-20 — Session 2 addendum 5 (audit-doc resync + #44 ship + smoke)

### What shipped
Three-commit audit-doc push (Code authored, Cowork reviewed before push):
1. `3bb8660` — investor + mentor audit addendum appended to `docs/product-audit-2026-04.md`. Cowork spot-checked 3 random citations against runtime knowledge, flagged ~50-line drift between Code's snapshot `402bf20` and current HEAD, requested resync before push.
2. `e37ccae` — 22 line-number citations resynced to current HEAD. Cowork verified 12 spot-checks; 11 correct, 1 off (M-08 FOUNDING_Q cited at 1425, actual 1431). Requested either push-with-follow-up or third amend commit.
3. `143deb2` — M-08 citation fix (1425 → 1431). Cowork verified. All three commits green-lit and pushed together.

Single-file commit for task #44 (Code authored):
- `aa37710` — wizSave error surfacing. 4-line diff at `src/app.js`:
  - L8117: `let partialSave = false;`
  - L8188: `partialSave = true;` + warn toast in retry-success branch ("⚠️ Save partial — server rejected some fields…")
  - L8204: `if (!partialSave) { toast('🎉 Profile created!…'); }` (guarded success toast)
  - L8223-8227: `trackEvent(partialSave ? 'onboarding_partial_save' : 'onboarding_completed', …)` with error_code + error_message merged in on partial branch
  Cowork code-reviewed the four-line diff; confirmed it matches the promised shape. Russell green-lit, Code pushed.

### What got verified (smoke of `aa37710` on prod)
Walk-through on `https://www.founderopscenter.com/?v=aa37710` signed in as `russell_cole@rocketmail.com`.

**Both-upserts-failed branch (line 8175-8181) — VERIFIED**
Accidentally exercised: a stale fetch interceptor from an earlier smoke harness had survived a soft page reload (URL query change doesn't force reload). When wizSave fired, both the full upsert and the minimal retry errored with `TypeError: Cannot read properties of undefined (reading 'push')` (the interceptor was trying to push to a nonexistent `__smoke.fetchCalls`). The production UI rendered the exact failure path `aa37710` was supposed to protect:

> **"❌ Save failed: TypeError: Cannot read properties of undefined (reading 'push') | code: unknown"**

Pre-`aa37710` this would have been silently swallowed or immediately clobbered by the success toast. Post-`aa37710` the error is visible, the wizard stays open, the button re-enables to "Complete Profile →", and no analytics event fires. `aa37710`'s main protection promise is upheld in prod.

**Happy path (line 8204 success toast) — UNVERIFIED in prod, VERIFIED by code review**
After restoring native fetch (via fresh iframe → also failed → via hard page navigate), re-walked the wizard. The Supabase upsert POST `/rest/v1/profiles?on_conflict=id&select=*` hung pending >75s and never resolved. This is a NEW backend issue — probably unrelated to `aa37710`, possibly related to russell_cole's account state after many smoke iterations, possibly an RLS or trigger deadlock. Not investigated further this run.

The happy-path branch is code-reviewable: `partialSave` starts `false`, only flips on retry-success (line 8188), and the success toast at 8204 is guarded by `if (!partialSave)`. No code path on success changes the flag, so the success toast is structurally unreachable-to-suppress on happy path. Same reasoning for trackEvent differentiation. The 4-line diff is bounded and symmetric.

**Partial-save branch (full fail + retry success) — UNVERIFIED**
Not exercised. The current schema is post-migration correct, so the full upsert doesn't reject due to schema drift anymore. Triggering this would require fetch-interception of just the first call — doable, but the interceptor-survival pattern above has bitten twice. Tabling unless a customer hits the issue in the wild.

### What's queued for Code
Tracked in Code's Option B list, deferred by Russell:
- Silent-catch audit for `syncProfileMeta`, `loadUserWorkspaces`, `consumePendingClaim`, `maybeAutoJoinOnFirstLogin`. Distinct audit pass.
- Network-level throw wrap for wizSave upsert (catch `fetch`-level exceptions that don't come through the supabase `{data, error}` protocol).
- F-16 root cause investigation (Code held pending session-log finalization).

### New finding flagged for follow-up
Supabase POST `/rest/v1/profiles?on_conflict=id&select=*` on russell_cole's account hangs indefinitely (>75s pending, no response). Tested with native fetch, fresh page, no interceptors. Possible causes: RLS misconfig, DB trigger deadlock, or JWT expiry being held instead of rejected. Worth a separate investigation ticket — not a regression from `aa37710` (wizSave's in-flight `⏳ Saving...` state is correct and the error-surface path would fire if the POST ever resolved with an error).

### Tasks closed
- #44 (wizSave error surfacing) → complete. Both-failed path verified on prod; happy + partial branches verified by code review.

### Queue held
Russell's last explicit signal: review `aa37710`, run smoke, then "finalize the session log for the whole run" before F-16 root cause. Session log is now finalized. F-16 root-cause investigation is the next tractable step when Russell picks it up.

---

## 2026-04-20 — Session 2 addendum 6 (F-16 live repro + closure)

### Summary
F-16 (BLOCKER: magic-link re-signin re-triggers onboarding, overwriting profile) is **CLOSED**. Live repro on prod, full server-side audit (triggers + RLS + profile row), and tape evidence from observation harness all converge on the same conclusion: **the prior fixes (`3ecc95e` + `c7ecb09`) already resolved the data-clobber mechanism.** The "Profile Incomplete — 67%" banner that triggered the original F-16 hypothesis is a UI completeness gauge, accurate for an under-filled account, not a clobber symptom. Two new tasks created during the investigation (#47 hanging Supabase REST, #48 Eco Workspace bootstrap bug). Both are independent of F-16.

### Live repro performed
On prod (`https://www.founderopscenter.com/?v=aa37710&t=clean`), tab signed in as `russell_cole@rocketmail.com` (user id `5e32ed9d-e2c6-4ebb-a57f-ad3bd85e6e99`, persona `investor`). Cowork installed an observation harness that:
- Wrapped `localStorage.setItem`/`removeItem` to log any key matching `/venture|onboard|wiz/i` with truncated value + 6-frame stack.
- Persisted observations to `localStorage.__F16_obs_log` (survives across same-origin tabs + reloads).
- Fired a direct REST GET against `/rest/v1/profiles?id=eq.<uid>` to capture pre-signout `onboarding_complete`.
- Polled the `_ventureStudioAfterSignIn` key every 250ms.

Russell signed out, opened the magic-link email on `russell_cole@rocketmail.com`, clicked the link. The link opened in a NEW tab outside the MCP tab group (Gmail's default behavior), so the harness's per-tab interceptors did not record events on the post-redirect page — but `__F16_obs_log` and current localStorage are domain-scoped, so post-cycle inspection from the original MCP tab still works.

### Findings — observation tape
Tape contained 4 entries across the cycle:
1. Pre-signout snapshot.
2. Pre-signout DB read attempt (eventually returned **HTTP 401** after 256s of tab-throttled hang — see Issue #4 below).
3-4. Two `setItem('foc_onboarded', '1')` writes from `dismissOnboard` at `src/app.js:1378`, called by `applyUser` at `:278`, called by Supabase auth-state callback at `:228`. These fire whenever the auth state propagates across tabs (same-origin `BroadcastChannel`).

**Crucially: NO writes to `_ventureStudioAfterSignIn` anywhere on the tape.** Full localStorage inventory post-cycle (27 keys) confirmed the key is absent. Code's leading hypothesis — that `_ventureStudioAfterSignIn` was being set during the magic-link round-trip and triggering the wizard auto-pop — is **ruled out for this repro**. (Code had previously mapped the setter to `src/app.js:764` with consumers at 384-386 and 443-446 that clear correctly; the live repro confirms nothing is setting it at all in this flow.)

### Findings — Ecosystem Workspace wizard auto-pops with literal "undefined" strings
Russell's screenshot of the post-magic-link landing showed:
- A "Profile Incomplete — Account at risk. Your profile is 67% complete. Complete Profile Now" banner.
- An auto-popped wizard titled "Let's set up your Ecosystem Workspace" with:
  - PROGRAM NAME field showing the literal string `undefined`.
  - LOCATION field showing the literal string `undefined`.

This is a **separate bug**, not F-16. Source trace:
- `pgEcosystemWorkspace()` at `src/app.js:15223` checks `if (!ecoConfig || !ecoConfig.setupComplete)` — true when no `foc_eco_config_<userId>` key exists yet.
- The init block (which seeds `_ecoSetupForm` from `_ecoSettings` with `|| ''` fallbacks) is at `:15229-15238`, **gated behind `if (_ecoSetupStep >= 0) return renderEcoSetupWizard();` at `:15227`**.
- Default values at `:14553-14554` are `let _ecoSetupStep = 0;` and `let _ecoSetupForm = {};`. Because the gate uses `>= 0`, the very first hit passes through and renders the wizard with an empty form object.
- Template at `:15113` and `:15124` does `value="${f.programName}"` and `value="${f.location}"` — no `|| ''` fallback. JS stringifies `undefined` as the literal string `"undefined"`.

Filed as task #48. Fix: `let _ecoSetupStep = -1;` AND add `|| ''` in the template (defense-in-depth). Russell decision: **queued, not shipped solo**, pending F-16 SQL outcome (now resolved — Eco fix is the next solo PR).

### Findings — server-side audit via SQL
Russell ran three SQL queries in the Supabase dashboard. Cowork read results from the SQL editor's results grid (Chrome MCP filter blocked editor reads in some cases; switching to grid-only DOM extraction worked).

**Query 1 — triggers on `public.profiles`.** ONE trigger:
- `profiles_updated_at` — `BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION update_updated_at()`. Standard timestamp hygiene. Function body not read (column outside grid viewport) but name + position make it certain to be `new.updated_at = now(); return new;`.
- **No cross-column writes. No clobbering trigger exists.**

**Query 2 — RLS policies on `public.profiles`.** Five policies:
| Policy | Cmd | Expression |
|---|---|---|
| `admin_read_all` | r | `(auth.jwt() ->> 'email') = 'russellcolevop@gmail.com'` |
| `admin_update_all` | w | `(auth.jwt() ->> 'email') = 'russellcolevop@gmail.com'` |
| `users_insert_own` | a | `with_check: auth.uid() = id` |
| `users_read_own` | r | `auth.uid() = id` |
| `users_update_own` | w | `auth.uid() = id` |

Observations:
- **No function references at all** (Russell asked specifically to flag any non-`is_admin()` function refs; the admin check uses no function — it's a hardcoded literal email comparison).
- **Admin grant is brittle:** hardcoded `russellcolevop@gmail.com`. Any email change to that account breaks admin. Worth a future cleanup (move to a `profiles.is_admin` boolean column or an `is_admin()` SECURITY DEFINER function), but not F-16-related.
- **No DELETE policy** (correct for soft-delete pattern).
- **No `WITH CHECK` on update policies and no column-level restrictions.** A user can UPDATE any column on their own row. So if the client sends an UPSERT with `onboarding_complete: false` or NULLs out fields, the DB happily accepts it. RLS isn't clobbering anything, but it also isn't defending against it. (For future hardening: a `WITH CHECK (id = auth.uid() AND onboarding_complete IS NOT FALSE)` or similar constraint would prevent client-side regression. Not urgent.)

**Query 3 — current `russell_cole@rocketmail.com` row:**
| Field | Value |
|---|---|
| `id` | `5e32ed9d-e2c6-4ebb-a57f-ad3bd85e6e99` |
| `email` | `russell_cole@rocketmail.com` |
| `full_name` | `russell_cole` (email localpart — never properly set) |
| `persona` | `investor` |
| `secondary_role` | (empty) |
| `onboarding_complete` | **`true`** |
| `blocked` | `false` |
| `location` | `Test City` |
| `agtech_focus` | `["Crop Technology"]` |
| `investment_stages` | `["Seed"]` |
| `created_at` | `2026-04-18 04:43:01.666 UTC` |
| `updated_at` | `2026-04-21 01:13:06.384 UTC` (touched during this session — an UPSERT did fire on sign-in) |

`updated_at` moving during the repro confirms the client did issue an UPSERT during the magic-link round-trip — but the row data is intact. Whatever payload was sent was idempotent (matched existing values closely enough that nothing material changed).

### F-16 verdict
**CLOSED.** Three theories were live coming into this session; all three are now resolved:
1. ~~DB trigger clobbers fields~~ → **NO.** One trigger, only touches `updated_at`.
2. ~~RLS forces a column reset~~ → **NO.** Policies are access-gates only, no function refs to audit.
3. ~~Client UPSERTs blank fields~~ → **NO.** UPSERT did fire, but payload was idempotent. Row preserved.

The "67% complete" banner that triggered the original F-16 report is a UI completeness gauge based on field-fill ratio, **not** based on `onboarding_complete`. It's accurate: `full_name` is "russell_cole" (email localpart, never replaced with a real name), `secondary_role` is blank, and other optional fields are sparse. The banner has been there all along for this account. Code's hypothesis lands.

The prior fixes that resolved the data-clobber mechanism: `3ecc95e` (wizRender double-`wizCollectInputs`) + `c7ecb09` (Edit Profile pre-fill). With those in place, sign-in UPSERTs are idempotent and don't blank existing data.

Task #38 closed.

### New finding — Issue #4 (Supabase REST hangs / 401) strengthened
Direct GET to `/rest/v1/profiles` from the original MCP tab returned **HTTP 401** after a long delay — the tab's stored auth token (`sb-odvwxgxhacotiuyjyqtk-auth-token`) was already expired. The "long delay" was largely Chrome's background-tab throttling (the Cowork tab was hidden behind the SQL editor tab); the actual underlying mechanism is **stale JWT, not a true network hang**. This is consistent with the earlier observation that wizSave's POST to `/rest/v1/profiles?on_conflict=id&select=*` hung indefinitely on the same tab during the `aa37710` smoke test — same root cause.

Filed as task #47. Lead hypothesis confirmed: when the JWT expires in-tab, requests don't fail-fast — they hang under tab throttling and surface as 401 only when the tab returns to foreground. Probable fix: add a JWT-expiry pre-check in the Supabase client, or rely on Supabase JS SDK's auto-refresh and ensure it's actually configured. Diagnosis-pending for next session.

### Tasks closed
- #38 (BLOCKER F-16) → **complete**. Closed via SQL evidence + live repro + tape analysis showing the prior fixes already resolved the clobber.

### Tasks created
- #47 — Issue #4: Supabase REST hangs indefinitely (POST + GET). 401 evidence captured. Stale-JWT lead hypothesis. Diagnosis-pending.
- #48 — Fix Ecosystem Workspace bootstrap init race + undefined template bug. Source citations at `:14553-14554`, `:15227`, `:15113`, `:15124`. Two-line patch (init `_ecoSetupStep = -1` + `|| ''` template guards). Queued as next solo PR.

### Queue held
Per Russell's call: ship the Eco Workspace bootstrap fix (#48) as the next solo PR. F-16 closed. Issue #4 (#47) parked for next session. Code's prior backlog still stands: silent-catch audit for `syncProfileMeta` / `loadUserWorkspaces` / `consumePendingClaim` / `maybeAutoJoinOnFirstLogin`, plus a network-level throw wrap for wizSave (which would have caught the Issue #4 hangs cleanly — bumped in priority by today's 401 evidence).

## 2026-04-20 — Session 2 addendum 7 (Eco Workspace fix shipped + goals conversation opened)

### What shipped
Code shipped `2b20a33` — "Fix Issue #5: Eco Workspace setup wizard renders literal 'undefined'". Three-line patch against `src/app.js`:
- `:14558` — `let _ecoSetupStep = -1;` (was `0`, which caused the `pgEcosystemWorkspace()` early-return gate to fire on first hit and skip profile-seeding of `_ecoSetupForm`).
- `:15118` — `value="${f.programName || ''}"` (template guard; prevents literal `undefined` appearing in the rendered input).
- `:15129` — `value="${f.location || ''}"` (same template guard for location).

Commit metadata confirmed: author Russell Cole, signed, `+8 −3`, co-authored with Claude Opus 4.7.

### Smoke verification on prod
Fetched `https://www.founderopscenter.com/src/app.js?v=2b20a33` directly (static verification — faster than a full re-login smoke loop on a signed-out tab):
- `let _ecoSetupStep = -1` found at line 14558; no `_ecoSetupStep = 0` initializer remains.
- `${f.programName || ''}` found at line 15118; no unguarded `${f.programName}` remains.
- `${f.location || ''}` found at line 15129; no unguarded `${f.location}` remains.
- HTTP 200, total lines 16173. **All three changes deployed.**

Full behavior-level re-run (sign in → Eco Workspace → walk wizard) deferred — static proof that the fixed bytes are on prod is sufficient for a template-guard change. Will get organically exercised next time an ecosystem_manager persona hits the wizard.

### Tasks closed
- #48 → **complete**. Eco Workspace bootstrap fix shipped + statically verified on prod.

### Queue state
Open: #47 (Issue #4 stale-JWT diagnosis, next-session), #37 (mentors nav link), #30 (data extraction), #33/#34 (investor + mentor persona audits, pending test accounts). Code's silent-catch / wizSave network-throw backlog still standing.

### Side thread — goals conversation opened
Russell raised the bigger question: is the platform actually good at setting users up, does the badge-matched introduction logic feel non-annoying, is each persona's info organized well, and — most importantly — are we building toward the right thing at all? He asked me to open with what I think his goals are so he can correct/add. I gave my read in chat (AgTech ecosystem network effects, reducing "who should I talk to" friction, workspaces-for-accelerators as Trojan horse, market intel as draw, solo/lean, not competing on data breadth with AgFunder, Russell-as-brand). Six gaps flagged for him to fill: commercial model, primary customer segment (flywheel driver), what "launch" means, time horizon/success metric, regional scope, life fit. Awaiting his corrections — this is the substantive next thread.


