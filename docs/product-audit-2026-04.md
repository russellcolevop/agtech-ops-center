# Founder Ops Center — Product Audit (Founder Persona)

**Audit date:** 2026-04-17
**Auditor:** Claude (Cowork mode), browser-driven walk-through
**Production commit at time of audit:** `6ec275e` (Phase 1 + Phase 2 module migration complete)
**Test account:** `russellcolevop+founder@gmail.com` (Founder persona, Explorer tier, 25% profile complete)
**Viewport:** 1440×900
**Personas audited:** Founder only. Investor and Mentor/Advisor audits pending.

---

## Executive summary

The founder journey has multiple blocking bugs that break the platform's core value proposition. A brand-new founder who signs up is greeted by a permanently-broken "My Connections" page (infinite render loop), has no way to reach the mentor directory, has their onboarding wizard data silently discarded, cannot reach the user menu from the main UI, and — most severely — loses their entire profile if they re-signin via magic link and re-run onboarding. None of these are cosmetic — they prevent the three stated founder goals (signup, connections to investors, mentor access) from completing, and one causes outright data loss.

Seven BLOCKER-tier issues were found. Fixing F-16, F-10, F-11, F-02, F-13, F-14, and F-15 should be the immediate focus — those account for most of the first-session user frustration Russell described and include one data-loss bug (F-16).

Severity scale used here:
- **BLOCKER** — breaks the stated goal for this persona
- **WEAK** — works but degrades trust or discoverability
- **GAP** — expected feature is absent
- **POSITIVE** — already good, don't regress

---

## Priority-ordered findings

### BLOCKER — fix first

#### F-16 · Magic-link re-signin re-triggers onboarding and overwrites the existing profile (DATA LOSS)
**Severity:** BLOCKER — this is a data-loss bug, not just a UX bug.

**Evidence:**
- Test account `russellcolevop+founder@gmail.com` signed in via magic link, completed onboarding as **Founder**, profile was saved (Organization `"test"` visible on the profile page).
- A subsequent magic-link signin with the **same email** re-triggered the onboarding wizard from Step 1 with nothing pre-filled.
- User selected **Investor** persona and completed onboarding. The previous Founder profile was overwritten entirely — sidebar branding switched to "Investor Ops Center" confirming the persona swap persisted.
- G icon (see F-11) visible in the resulting session. Session token in localStorage shows a valid Supabase user.
- This will repeat: every future magic-link signin with the same email dumps the user back into onboarding.

**What happens:** On every auth event, the app appears to enter the onboarding wizard without checking whether the user already has a completed profile. Whatever persona the user picks then overwrites the prior record — no merge, no confirmation, no "you already have a profile" guard.

**User impact:** A user who signs in a second time loses their first persona's profile. Any intro requests, connections, and other records tied to the prior profile are orphaned or broken. This is worse than F-02 (wizard data not persisting): F-02 leaves fields empty; F-16 overwrites saved fields with different-persona data.

**Probable causes (to investigate — these are hypotheses, not confirmed):**
1. `applyUser()` (or equivalent post-signin hook) has no guard like `if (_userProfile?.onboarding_complete) { skipWizard(); }`.
2. The profile fetch on signin may be silently failing (RLS block, column mismatch, race condition) and returning null/empty, which the app then treats as "new user."
3. The `onboarding_complete` flag may never be written at the end of the wizard.
4. The wizard's final save path may be an `upsert` with no `on conflict` guard, so it overwrites existing rows wholesale.

**Fix:**
1. Add a hard guard: if `_userProfile?.onboarding_complete === true` is loaded successfully, DO NOT trigger the wizard on subsequent signins. Send the user straight to the Action Center (or their last page).
2. Audit the profile-fetch path on signin — replace any silent catches with observable error logging (toast + console.error) so RLS or schema failures are visible rather than presenting as "new user."
3. Confirm `onboarding_complete: true` is actually written to the profile row at the end of the wizard. If it's missing, that's a root cause on its own.
4. Before any wizard save operation that would overwrite fields, check if a profile already exists and either (a) prompt the user to confirm they want to overwrite, or (b) block the overwrite entirely for users who already have saved data.

**Relationship to other blockers:** This is related to but **distinct from** the wizard-Back data-loss bug that Code diagnosed (`wizRender()` calling `wizCollectInputs()` against stale DOM and overwriting `wizData` with empty strings). F-16 fires even when the user never presses Back — the trigger is the second signin itself. Both bugs should be fixed, but F-16 won't be resolved by fixing the Back bug alone.

---

#### F-10 · My Connections page never escapes "Loading your connections…"
**Location:** `src/app.js:10422-10429` — `pgUserConnections()`

```js
if (!_allProfiles.length || !_userIntros.length) {
  const promises = [];
  if (!_allProfiles.length) promises.push(loadAllProfiles().then(r => { _allProfiles = r; }));
  promises.push(loadUserIntros().then(r => { _userIntros = r; }));
  if (promises.length) {
    Promise.all(promises).then(() => render('connections'));
    return `<div>⏳ Loading your connections...</div>`;
  }
}
```

**What happens:** One of the load calls silently returns an empty array (likely RLS or schema). `_allProfiles.length` stays `0`. Every subsequent `render('connections')` re-enters this block, fires a fresh `Promise.all`, which resolves and calls `render('connections')` again. Infinite loop.

**Empirical evidence:** Forced `window.render('profile')` every 250 ms for 15 s — the profile view never stuck; connections kept stomping over it.

**User impact:** My Connections appears to be the default landing page for this signed-in user (confirmed in the audit run), so the first thing a new founder sees is a permanent hourglass.

**Fix:**
1. Add a `.catch()` to the `Promise.all` so failures stop the loop and log the error.
2. Seed `_allProfiles` / `_userIntros` with a sentinel value (e.g. `[{__sentinel:true}]`) on failure so the `length === 0` check doesn't re-trigger.
3. In the renderer, distinguish "still loading" from "loaded but empty" explicitly (use a separate `_connectionsLoadState` variable with `idle | loading | loaded | error`).

---

#### F-02 · Onboarding wizard data not persisting to the profile
**Location:** Wizard in `src/app.js` (wizSave → Supabase write). See also F-13.

**Evidence:** After completing onboarding, the profile shows Organization: `"test"` (one field that did persist) but `LinkedIn URL`, `Location`, `Company Name`, `Company Stage`, `What You're Building`, `Funding Status` are all empty. Profile Completeness reads 25%.

**User impact:** The platform asks many onboarding questions (Russell's own complaint: "way too cumbersome … too many questions") and then throws most of the answers away. Every downstream surface that keys off profile data (Action Center, intro matching, mentor recommendations) is crippled for all users who completed onboarding.

**Probable cause:** Silent-catch pattern in the wizSave Supabase call, or `_wizForm` → profile column mapping is incomplete. Matches the structural bug class Claude Code already flagged in venture_submissions (`src/app.js:5622` — `try { await _supabase.from('venture_submissions').insert([submission]); } catch(e){}`).

**Fix:**
1. Audit every `try { await _supabase.from(...)… } catch(e){}` in the file and replace with an observable error pipeline (toast + console.error).
2. Log the wizSave payload and the Supabase response side-by-side for one test submission to find which fields are dropped.
3. Confirm the DB column names match the `_wizForm` keys (case, snake_case, presence).

---

#### F-11 · "G" avatar opens the sign-in modal even when the user is signed in
**What it should do:** Show a user menu (View Profile, Settings, Sign Out).

**What it does:** Opens the sign-in modal. Clicking the Google button or entering an email triggers a new auth attempt.

**Evidence:** Reproduced on a signed-in session (expiry valid for another 40 min). Session key `sb-odvwxgxhacotiuyjyqtk-auth-token` present in localStorage with valid user; clicking the avatar still opens `signin-modal`.

**User impact:** Users cannot sign out from the main UI. They cannot reach profile settings from the header. The only way to surface profile is via the hidden `👤 My Profile` button (discoverable only through the find tool, not visible in the nav).

**Fix:** Wrap the avatar's onclick in `currentUser ? toggleUserMenu() : openModal('signin-modal')` and build a simple menu. Also address F-01 (render initials/photo in place of the generic Google G).

---

#### F-13 · Edit Profile wizard opens blank, forcing users to retype everything
**Location:** `editWizard()` / `wizRender()` in `src/app.js`.

**Evidence:** User has `organization: "test"` saved. Clicking "✏️ Edit Profile" opens the wizard at Step 1 of 5. Persona IS pre-selected (Founder highlighted). Step 2 of 5 ("Basic info") — Organization, Title, LinkedIn, Location — all four inputs empty. The wizard does not seed its state from `_userProfile`.

**User impact:** Editing one field means retyping all of them, or abandoning the edit. This also conceals F-02 because users can't tell which of their fields are actually saved.

**Fix:** In `editWizard()`, populate `_wizForm` from `_userProfile` (including the `focus_areas` multi-select) before the first render.

---

#### F-14 · Mentors directory is orphaned — route is a one-line stub
**Location:** `src/app.js:15604`

```js
mentors: function(){ go('hub'); return ''; }
```

**What this does:** Every click on a "Mentors" link silently redirects to the Community Hub (the 151K-char everything page).

**What's odd:** `pgMentors()` — a full mentor directory renderer with filters, 84 mentors, and filter UI — exists at `src/app.js:4961`. It is never called.

**User impact:** One of the two stated founder needs (mentor access) has no dedicated surface. Mentor discovery is buried inside a combined Hub page mixing mentors, communities, podcasts, newsletters, and leaders.

**Fix:** Change the pages registry entry to `mentors: pgMentors`. Combine with F-15 to make it reachable from the sidebar.

---

#### F-15 · No "Mentors" item in the founder sidebar
**Evidence:** Sidebar nav scraped from the live DOM contains: Overview, Market Intelligence, Founder's Journey, Glossary, Founder Toolkit, Ecosystem Overview, Crops, Community Hub, Venture Studio, Accelerator Hub, Resources, Investor Dashboard, Ecosystem Workspace, Action Center, My Connections, Roadmap, Admin. No "Mentors" or "Advisors".

**Secondary issue:** "Investor Dashboard" is visible to founders, but that surface is built for investors managing deal flow — it's the wrong thing for a founder trying to reach investors. Founders need "Investor Directory" or "Request Intro".

**Fix:** Add a persona-filtered "Mentors & Advisors" nav item. Rename or hide "Investor Dashboard" when persona = founder and surface a founder-facing "Investor Directory" instead.

---

### WEAK — fix once blockers are clear

#### F-01 · Generic "G" icon as logged-in user avatar
Render the user's initials in a colored circle (the profile page itself already does this correctly with a green "R" — the component exists, it's just not used in the header).

#### F-04 · "Russell Cole" widget in every user's sidebar is confusing
Bottom-left sidebar shows Russell's headshot, "LinkedIn ↗", and "📞 Book a Call with Russell" — placed where users expect their own account widget. The concierge angle is fine, but label it: "Need help? Book a call with the founder" and move it out of the account-widget slot.

#### F-05 · Founder's Journey is static blog content
Reads as generic advice ("Apply to Founder Institute", "Validate the problem"). No Stage X indicator based on profile. Generic bullets don't link to concrete platform actions (e.g., the line "Join accelerators" could link to the Accelerator Hub filtered by stage).

#### F-06 · Core value prop buried in nav
Sidebar order is resources-first (Global Resources → Region-Specific Data → My Tools). Founders' primary tools (Action Center, My Connections) live under a collapsed "My Tools" group. Consider promoting a "For Founders" group to the top when `persona = founder`.

#### F-07 · Action Center claims personalization but serves static external referrals
Header promises "personalized for you as an AgTech professional." Actual content: 4 hardcoded cards, all external (subscribe to newsletter, join Slack, attend event, browse accelerators). No internal platform actions.

#### F-12 · Default landing page appears to be My Connections (the broken page)
`src/app.js:15677` reads a saved page from localStorage; the fallback is `overview`, but new signed-in users appear to land on `connections` based on the audit session. For founders with `onboarding_complete: true` and an incomplete profile, default to Action Center.

---

### GAP — expected surfaces that don't exist

#### F-08 · Action Center is missing founder core surfaces
Missing action cards:
- "Complete your profile (25%)" — with a direct link
- Mentor discovery
- Investor intro requests
- Founding Q status
- Venture submission status

Action Center is the right place for all of these.

#### F-35 (merged with F-10) · No error UI when Supabase calls fail
The entire app relies on silent-catch patterns (at least 6 confirmed in `src/app.js`). A brand-new founder has no signal when auth, profile, or intro writes fail silently. Adding a lightweight toast-based error channel (`showErrorToast(err)`) and routing every Supabase catch through it would expose the real health of the system.

---

### POSITIVE — keep these

#### F-03 · Profile page itself is well-designed
Clear tier ladder (Explorer → Builder → Operator → Leader), badge counter, specific missing-field pills. The tier model gives users a concrete next-step orientation.

#### F-09 · Pitch Competitions & Accelerators widget
Shows "17 programs" — concrete, content-rich, expandable in place. This is the pattern the Action Center should mimic for internal data surfaces.

---

## Suggested remediation order

Do these in order. Stop after 1–3 to sanity-check the platform is usable and that no user data is being destroyed.

1. **F-16** — close the re-onboarding data-loss hole. Add the `onboarding_complete` guard, surface profile-fetch errors, and prevent wizard-save from overwriting an existing profile. This is the only bug in the list that actively destroys user data, so it goes first. Half a day.
2. **F-10** — fix the infinite render loop on My Connections. 30-min fix. Without this, every new founder's first impression is a broken page.
3. **F-11** — wire a real user menu to the avatar. Also add signout surface. 30-min fix.
4. **F-02 + F-13 + wizard-Back bug** — audit the wizard save path. Seed `wizForm` from `_userProfile` on edit. Fix the `wizRender → wizCollectInputs` double-call. Log payload. Replace silent catches with toasts. 2–3 hours.
5. **F-14 + F-15** — make mentors reachable. 15-min route fix (`mentors: pgMentors`) + sidebar nav item. 30 min total.
6. **F-12** — change default landing page for signed-in users with `persona=founder` to Action Center. 15 min.
7. **F-07 + F-08** — rework Action Center to surface internal platform actions (profile completion, mentor discovery, intro requests) instead of external newsletter signups. Half a day.
8. Rest of the WEAK findings as time permits.

---

## Still to audit

- Welcome modal (first-run intro)
- Notification bell
- Venture Studio multi-step wizard end-to-end (step 1 confirmed rendering; data-persistence path unverified)
- Accelerators page (previously blocked by the "r is not defined" ReferenceError; needs re-test on 6ec275e)
- Mobile viewport (768×1024 and 375×812)
- ~~**Investor persona** (task #33)~~ — done, see addendum below
- ~~**Mentor/Advisor persona** (task #34)~~ — done, see addendum below

---

## 2026-04-20 ADDENDUM — Investor + Mentor/Advisor audits

**Audit date:** 2026-04-20
**Auditor:** Claude Code (static source analysis, no browser interaction)
**Production commit at time of audit:** `402bf20` (post F-02/F-13/F-16-schema-drift fix)
**Methodology:** Explore agents over `src/app.js` + targeted reads against the investor-facing and advisor-facing surfaces, cross-referenced against Russell's stated persona goals (investor = "top-quality deal flow, market intel, intro system"; advisor = "be available to founders and investors"). No live test accounts used.

Findings complement the founder-persona audit above. Several findings are flagged "needs browser verification" — they're structural observations that a runtime pass could either confirm or refine. Same severity scale as the founder section.

### Executive summary

**Investor persona** has the strongest value-prop surface in the codebase (`pgInvestorDashboard` renders real region-filtered market data, founder pipeline from live profiles, ecosystem maturity scores, sector heatmaps), but one BLOCKER-tier flaw guts the core promise: the "Request Intro" button on founder cards in the pipeline is a plain `<a href>` to LinkedIn — not a platform intro request. Every click leaves the platform. On top of that, all intros-as-a-system issues flagged in the founder audit apply equally here (mailto-only delivery, no admin notification, no outcome loop).

**Advisor persona** is the weakest of the three. The platform has an `advisor` persona (wizard supports it, welcome email exists, profile page renders advisor fields) but no surface where advisors are *discoverable* by founders or investors. The `pgMentors()` directory shows only 84 static entries from `window.MENTORS` — signed-up advisor profiles never appear there. Combined with the founder audit's F-14/F-15 (now fixed in `2d945b0`), reaching the static mentor directory works, but it doesn't surface live advisor signups. Advisors who complete onboarding effectively join an empty room.

Five BLOCKER-tier issues across the two personas. I-01 (LinkedIn-link-instead-of-intro) and M-01 (advisor invisibility) together account for most of the broken-core-promise symptoms a real investor or advisor would hit within 60 seconds of signing up.

---

### Investor persona (task #33)

#### I-01 · "Request Intro" on Investor Dashboard pipeline is a LinkedIn href, not a platform intro request
**Severity:** BLOCKER

**Location:** [src/app.js:12137](src/app.js#L12137) in `pgInvestorDashboard()`'s `pipelineFounders` map.

```js
const liLink = p.linkedin_url ? `<a href="${p.linkedin_url}" target="_blank" rel="noopener" class="ac-btn primary" style="margin-top:8px;font-size:11px;padding:5px 10px">Request Intro →</a>` : '';
```

**What happens:** An investor lands on the dashboard, sees the "Live Deal Flow" pipeline with up to 12 founder cards, clicks "Request Intro →" on one. The button opens the founder's LinkedIn in a new tab. No record written. No email sent. No intro flow initiated. Platform exits.

**Contrast:** The Community Hub's user cards at [src/app.js:10571](src/app.js#L10571) correctly wire `requestIntro(o.id, score, reasons)`, which inserts into `introductions` and walks the tier/limit gates. The investor dashboard — the *primary* surface for an investor browsing founders — does not.

**User impact:** An investor's single most important action on the platform ("I want to meet this founder") routes off-platform. The platform captures no signal, no match score, no notification to Russell. An investor who uses LinkedIn for every "intro" effectively gets zero benefit from being on the platform.

**Fix:** Replace the `<a href>` with `<button onclick="requestIntro('${p.id}', ${score}, ${JSON.stringify(reasons)})">`. Reuse the scoring function from `connDiscoverTab` (`scoreMatch(p, other)` at [src/app.js:10595](src/app.js#L10595)) to generate meaningful match reasons. Optionally keep the LinkedIn link as a secondary affordance for investors who want to check credentials before the intro.

---

#### I-02 · Intro requests create Supabase rows but never trigger email delivery
**Severity:** BLOCKER
**Shared with:** founder audit (same root — this is the platform-wide intro mechanism, not investor-specific).

**Location:** [src/app.js:10431](src/app.js#L10431) — `sendIntroEmail()` uses `window.open('mailto:...')` instead of `sendAutoEmail()` (the working Resend Edge Function already wired for welcome + eco-approval emails at [src/app.js:205](src/app.js#L205)).

**What happens:** When an investor successfully requests an intro (via Community Hub, since I-01 blocks the Dashboard path), a row lands in `introductions` with `status='suggested'`. Nothing is emailed — not to the investor, not to the founder, not to Russell. Russell must manually notice the row in the admin panel and trigger `sendIntroEmail()`, which itself opens a `mailto:` link requiring Russell to manually send from his email client.

**User impact:** The investor sees a success toast ("Intro request sent") and hears nothing for days. Russell becomes a blocking resource on every intro. Doesn't scale past Russell's attention bandwidth.

**Fix:** Replace the `mailto:` open in `sendIntroEmail()` with `sendAutoEmail(profileA.email + ',' + profileB.email, subject, html)`. Add a second `sendAutoEmail(RUSSELL_EMAIL, ...)` call inside `requestIntro()` and `submitMentorIntroRequest()` so Russell gets notified at request time, not just send time. Templates can follow the existing `FOC_EMAIL_TEMPLATES.ecoAccepted` shape.

---

#### I-03 · Investor Dashboard depends on `_allProfiles` population — empty DB means empty pipeline, no fallback
**Severity:** WEAK
**Location:** [src/app.js:12086](src/app.js#L12086)

```js
const pipelineFounders = _allProfiles.filter(p =>
  p.persona === 'founder' && p.onboarding_complete && !p.blocked &&
  (p.funding_status || (p.biggest_needs && p.biggest_needs.includes('Funding')))
);
```

**What happens:** Pre-launch or during slow periods, `pipelineFounders.length === 0`. The Dashboard renders "Active Opportunities: 0" with no explanation and no call-to-action. Contrast with Community Hub's "You're one of the first here — invite someone..." messaging at [src/app.js:10576](src/app.js#L10576).

**User impact:** An investor who signs up early sees an empty platform and has no reason to return. No "we'll notify you when new founders join" hook.

**Fix:** Add an empty-pipeline state that (a) states the member count transparently, (b) offers to notify the investor when new matching founders join, and (c) surfaces the *static* deal-flow data (`INVESTOR_DEALS`, `INVESTOR_EXITS`) more prominently so the page isn't blank. The infrastructure already exists — just the copy pivot is missing.

---

#### I-04 · Company Intel and live founder profiles are two disjoint universes
**Severity:** GAP
**Location:** `pgMarketIntel`'s Company Intel tab at [src/app.js:3325](src/app.js#L3325) reads `AGTECH_COMPANIES` (static, ~200 curated entries from THRIVE Top 50 / Yield Lab / etc.). The investor's "Live Deal Flow" at [src/app.js:12086](src/app.js#L12086) reads `_allProfiles` filtered by `persona='founder'`.

**What happens:** Company Intel is a read-only curated database of industry companies. Live Deal Flow is the real founder pipeline on the platform. No crosswalk between them — a founder on the platform whose company is *also* in `AGTECH_COMPANIES` appears twice (once in each universe) with no indication of the match.

**User impact:** Investors see "200+ companies in our Company Intel" and "N founders in Live Deal Flow" as separate lists. If a platform founder's company matches a curated Company Intel entry, the investor has no way to know that founder is reachable via intro. A concrete lost-value scenario: investor reads about a CEA startup in Company Intel's Canadian Spotlight, doesn't realize its founder is on the platform, doesn't request an intro.

**Fix (not trivial):** Add a `company_name` match between `_allProfiles` and `AGTECH_COMPANIES`. On Company Intel cards, show a "This founder is on the platform — Request Intro →" badge when there's a match. Bidirectional: on Live Deal Flow founder cards, show a "Featured in [THRIVE Top 50 / Yield Lab Portfolio / etc.]" badge. This is a small amount of code once the matching is decided; bigger question is whether `company_name` is reliable enough or you need fuzzy matching.

---

#### I-05 · No user-controlled sorting on the founder pipeline
**Severity:** WEAK
**Location:** [src/app.js:12133](src/app.js#L12133) — `.slice(0,12)` shows the first 12 in whatever order `_allProfiles` arrives.

**What happens:** An investor with specific criteria (stage, sector, region) has filters for *some* of those (region filter at :11808), but no way to sort by company stage, funding status, profile completeness, or recency. Top 12 is the hard cap.

**User impact:** Investors filtering by seed-stage CEA startups in Canada can narrow by region, but the resulting 12 cards are in DB order, not match-score order. Power-users will ignore the Dashboard.

**Fix:** Add a sort control with options: Recently joined / Match score / Profile completeness / Stage / Funding status. Remove the `.slice(0,12)` cap or add pagination.

---

#### I-06 · Intro tier preference enforcement is inconsistent
**Severity:** WEAK
**Location:** [src/app.js:10595-10606](src/app.js#L10595-L10606) vs [src/app.js:10910](src/app.js#L10910).

**What happens:** `connDiscoverTab()` computes `meetsOtherPref = myTier >= otherPref` and uses it to categorize matches (matched-and-requestable vs tier-gated). But `requestIntro()` itself — which an investor can invoke directly from the dashboard (post-I-01 fix) or via Community Hub — does *not* re-check the target's `intro_tier_pref` before inserting. An investor who hasn't earned enough badges can bypass the gate by calling `requestIntro` directly, or (more realistically) a future surface that calls it without the pre-filter.

**User impact:** Tier gates are leaky. A founder who set `intro_tier_pref='leader'` (only receive intros from top-tier members) still receives intros from `explorer`-tier investors if the path bypasses `connDiscoverTab`.

**Fix:** Move the `meetsOtherPref` check *into* `requestIntro()` itself, next to the network-threshold and pause-status gates already there. Defensive and centralized.

---

#### I-07 · Intro request has no "what I'm offering" context field
**Severity:** GAP
**Location:** `requestIntro()` signature is `(otherId, score, reasons)` — no mechanism for the investor to add a custom note.

**What happens:** Investor decides they want to connect with a founder, clicks Request Intro. An `introductions` row is created with match_reasons (auto-generated). No way for the investor to say *why* they want the intro or *what they can offer* (check size, sector fit, operational expertise). The founder sees an auto-generated request with no context.

**User impact:** Founders receiving intro requests can't differentiate serious well-matched investors from casual clickers. The mentor intro request path at [src/app.js:4868](src/app.js#L4868) already has a textarea — Russell built this pattern correctly for mentor intros, but the investor-to-founder intro flow doesn't have the equivalent.

**Fix:** Match `requestMentorIntro`'s modal pattern — `requestIntro` opens a modal with a textarea ("Tell [founder] why you'd like to connect"), stores the text in `introductions.match_reasons` or a new `requester_note` column. When Russell reviews the request in the admin panel, the context is there.

---

#### I-08 · No "watchlist" or saved-founders feature
**Severity:** GAP

**What happens:** An investor browsing the pipeline can't bookmark founders for later review. Every visit starts fresh with the top 12. No way to say "I want to watch this founder for Q3 stage progression before asking for an intro."

**User impact:** Investors evaluate over weeks, not minutes. Without persistence, the platform is a one-shot pitch each visit.

**Fix:** Add a `saved_founders` JSONB column to profiles. UI: a star icon on each founder card; a "Saved" filter tab on the Dashboard. 

---

#### I-09 · Investor Dashboard sections — real value, keep
**Severity:** POSITIVE

Specifically: Ecosystem Maturity Index at [src/app.js:11868](src/app.js#L11868), Capital Concentration / Money Flow at [src/app.js:11915](src/app.js#L11915), Sector Heatmap at [src/app.js:11963](src/app.js#L11963), Most Active VCs at [src/app.js:12026](src/app.js#L12026), Exits & M&A at [src/app.js:12047](src/app.js#L12047). These are structured content an investor could not easily reconstruct from public sources in an afternoon. Region filter at [:11808](src/app.js#L11808) works correctly. The surface is genuinely useful — I-01 and I-02 fix the intro pipe, not this content.

---

#### I-10 · Market Intel with chip-selectable sectors and Company Intel Directory filters — keep
**Severity:** POSITIVE

`pgMarketIntel()` at [src/app.js:3325](src/app.js#L3325) with its tabbed structure (sectors / trends / matrix / signals / personas / crosswalk / companies) and the Company Intel Directory's filter/search/sort controls at [src/app.js:3708](src/app.js#L3708) are good. The crosswalk question (I-04) is about connecting them to live founders, not about the content itself.

---

### Mentor/Advisor persona (task #34)

#### M-01 · Signed-up advisors are invisible — no directory surfaces live advisor profiles
**Severity:** BLOCKER

**Location:** `pgMentors()` at [src/app.js:4967](src/app.js#L4967) reads `window.MENTORS` (static, 84 entries from `data/mentors.js`). `window.MENTORS` has no mechanism for platform-side advisor profiles to appear in it. Community Hub's mentor accordion at [src/app.js:11363](src/app.js#L11363) reads `window.HUB_MENTORS` (a different static set in `data/hub.js`).

**What happens:** An advisor completes onboarding (persona = `advisor`, fills `expertise_areas`, `advising_count`, `advisor_interests`). Their profile is saved. They sign out. They sign back in. They navigate the app. Nothing surfaces their profile to other users. The mentor directory shows 84 static entries; live advisor profiles are absent. The only place an advisor's profile can be reached is My Connections → Discover tab (the intro-matching surface), which — per the founder audit's F-10 — was broken until `2d945b0`.

**User impact:** Russell's stated goal for this persona — "advisors and mentors need to be available to both [founders and investors]" — has no implementation. Advisors who sign up join an invisible room. Founders and investors have no way to discover them. Discovery → intro → conversation is blocked at the discovery step.

**Fix:** Two-step:
1. Add a second data source to `pgMentors()` — union `window.MENTORS` with `_allProfiles.filter(p => p.persona === 'advisor' && p.onboarding_complete && !p.blocked)`. Render live advisors alongside static mentors with a "Platform Member" badge to differentiate. Wire "Request Introduction" on live-advisor cards to `requestIntro(advisor.id, ...)` (platform intro), and keep the existing `requestMentorIntro(mentor.id)` for static entries.
2. Longer-term: migrate static `MENTORS` into Supabase (`pre_created_profiles` already supports this pattern — Russell uses it for pre-loaded founders). Unifies the two universes.

Also depends on founder audit's F-15 (no Mentors nav item — fixed in the upcoming nav pass).

---

#### M-02 · Onboarding wizard has no Step-2 validation for `advisor` persona
**Severity:** BLOCKER
**Location:** [src/app.js:8083-8097](src/app.js#L8083-L8097) — `wizNext()`'s step-2 validation has `else if` branches for founder / investor / farmer / researcher, none for advisor (also none for ecosystem_manager / service_provider / industry_pro).

**What happens:** An advisor reaches Step 2 of onboarding, the "Details" step. This step is supposed to collect `expertise_areas`, `advising_count`, `advisor_interests`. Step-2 validation checks none of these. User clicks Next with empty fields, advances to Step 3. Wizard completes. Profile saved with empty `expertise_areas`, empty `advising_count`, empty `advisor_interests`.

**User impact:** Compounds M-01. Even if the directory surface existed, the advisor's profile would be un-searchable by expertise because the expertise field is empty. Russell's founder audit F-02 (data not persisting) *also* hits advisors — but the validation gap means advisors can't even ENTER the data for it to fail to persist.

**Fix:** Add an `else if (wizData.persona === 'advisor') { ... require expertise_areas.length > 0, advising_count, advisor_interests ... }` branch in `wizNext()` step-2 validation. Same treatment for `ecosystem_manager` (require `company_name` + `team_size`), `service_provider` (require `service_type`), `industry_pro` (require `organization` + `job_title`).

---

#### M-03 · No "founders who need you" surface for advisors
**Severity:** BLOCKER (for this persona's stated goal)
**Location:** Nowhere. This surface doesn't exist.

**What happens:** An advisor signs in. Action Center at [src/app.js:11561](src/app.js#L11561) renders persona-specific recommendations from `PERSONA_RECS` — but `PERSONA_RECS` is keyed by `early-stage` / `growth-stage` / `investor` / `ecosystem_mgr` / `researcher` / `farmer`. No `advisor` key. The fallback is `early-stage` (founder). So an advisor lands on an Action Center pitched at founders.

More broadly, there's no page that says "here are founders with `biggest_needs` matching your `expertise_areas`, who would benefit from your help." Advisors can't find founders who need them. Founders can (post-M-01-fix) find advisors in the mentor directory. The discovery is one-way.

**User impact:** Even a highly-engaged advisor has nothing useful to DO on the platform. Their only action is passive: wait to be discovered. Fails Russell's stated goal that advisors be "available to both [founders and investors]" in any active sense.

**Fix:** Persona-specific Action Center content for advisor: surface founders whose `biggest_needs` match the advisor's `expertise_areas`, and investors whose `deal_interests` align with the advisor's `focus_areas`. Requires adding `advisor` key to `PERSONA_RECS` or refactoring `pgActionCenter` to read from profile match-scoring instead of static content.

---

#### M-04 · Two separate static "mentor" datasets with overlapping but different content
**Severity:** WEAK
**Location:** `window.MENTORS` ([data/mentors.js](data/mentors.js), 84 entries) vs `window.HUB_MENTORS` ([data/hub.js](data/hub.js), 14 entries at last count — though Phase 3 audit flagged this as having zero references from src/app.js, which now turns out to be wrong — it's read by `hubMentorContent()` at [src/app.js:11363](src/app.js#L11363)).

**What happens:** Two static mentor lists. `MENTORS` has 84 AgTech-specific names sourced from Western Growers Center for Innovation & Technology (per the footer at [src/app.js:11441](src/app.js#L11441)). `HUB_MENTORS` has a different, smaller curated set. They overlap partially. A user browsing Community Hub sees HUB_MENTORS; a user navigating to `/#mentors` sees MENTORS. Neither list links to the other.

**User impact:** Inconsistent discovery — a mentor appears in one surface but not the other. Data maintenance doubles.

**Fix:** Pick one data source. `MENTORS` is the richer list (84 entries with availability / compensation / country) so consolidate to that. Update `hubMentorContent()` to read from `MENTORS`. Delete `HUB_MENTORS` from `data/hub.js`.

---

#### M-05 · Mentor intro request creates row but sends no notification
**Severity:** WEAK
**Shared with:** founder audit (same class as I-02).
**Location:** `submitMentorIntroRequest()` at [src/app.js:4891](src/app.js#L4891).

**What happens:** Founder (or investor) requests an intro to a static mentor. A row is inserted into `introductions` with `person_b = null` (because static mentors aren't Supabase users) and `admin_notes = 'MENTOR INTRO REQUEST — [name] ([firm]) — Note: [user text]'`. No email to Russell. The in-app notif bell (`updateNotifBell()`) updates — but only if Russell has the tab open.

**User impact:** Mentor intros queue silently. Same class as founder audit finding (I-02 equivalent) but narrower in blast radius since mentor intros are lower-volume.

**Fix:** Same as I-02 — `sendAutoEmail(RUSSELL_EMAIL, 'Mentor intro request: ' + m.name, body)` inside `submitMentorIntroRequest`.

---

#### M-06 · `person_b: null` for static mentor intros creates half-formed Supabase rows
**Severity:** WEAK
**Location:** [src/app.js:4899](src/app.js#L4899)

**What happens:** `introductions` table has columns `person_a` (uuid → profiles.id) and `person_b` (uuid → profiles.id). Static mentors aren't Supabase users, so inserts set `person_b = null` and stuff the mentor's name into `admin_notes`. Queries like "show all intros involving mentor X" can't run — there's no foreign key to match on. Admin dashboards that group by `person_b` miss these rows entirely.

**User impact:** Admin visibility into mentor intro volume requires full-text scanning `admin_notes`. Reports are harder than they should be.

**Fix:** Two options, pick one.
- (A) Add a `target_mentor_id integer` column to `introductions` that references the static `MENTORS` array's `id` field. Cheap, preserves the static-data pattern.
- (B) Migrate static mentors into `pre_created_profiles` (already supported, already RLS-hardened — see [20260418_fix_rls_gaps.sql](supabase/migrations/20260418_fix_rls_gaps.sql)). Then `person_b` is a real uuid. Unifies with M-01's long-term fix.

---

#### M-07 · Advisor availability / capacity has no UI surface
**Severity:** GAP
**Location:** `profiles.advising_count` exists (text field, collected in wizard) — but it's a free-text field ("2-3 per month") with no structured value. No way for advisor to say "I'm full, not accepting intros right now."

**What happens:** Static `MENTORS` entries have an `available` field (values: `'Yes'`, `'Limited'`, `'No'`) with visible UI indicators (green/yellow/red dot badges in the mentor card — see [src/app.js:4949](src/app.js#L4949)). Advisor profiles have no equivalent. An advisor at capacity has no way to pause intros without going fully offline.

**User impact:** Advisors either get flooded or disengage entirely. No middle ground.

**Fix:** Add `accepting_intros` (boolean, default true) + `intro_capacity_note` (text, optional) to profile schema. Respect `accepting_intros = false` as a gate in `requestIntro()` alongside the existing tier and pause gates.

---

#### M-08 · No advisor-specific Founding Q
**Severity:** GAP
**Location:** `FOUNDING_Q` object at [src/app.js:1431](src/app.js#L1431) has keys for `founder`, `investor`, `advisor`, `ecosystem_manager`, `researcher`, `farmer` — **so it DOES have an advisor key.** Correcting myself — advisors DO get a persona-tailored Founding Q (5 questions: motivation, match-preference, time-commit, platform-wish, compensation). This was my misread during the initial audit notes — flagging now as verified-present rather than gap.

**Severity reclassification:** POSITIVE — advisor Founding Q exists, 5 questions, substantive.

---

#### M-09 · Static MENTORS data is rich and well-structured — keep
**Severity:** POSITIVE
**Location:** [data/mentors.js](data/mentors.js)

84 entries with `name`, `firm`, `expertise`, `focusAreas`, `experience`, `startups`, `available`, `comp`, `country`, `linkedin`. Sourced from Western Growers Center for Innovation & Technology (CC BY 4.0). Solid foundation. `pgMentors()` renders them well with filters (search / country / availability / compensation). After the F-14 route fix (landed in `2d945b0`), this surface is live and usable.

---

#### M-10 · Mentor detail view UX — keep, replicate for advisors
**Severity:** POSITIVE
**Location:** `hubMentorContent()` at [src/app.js:11391](src/app.js#L11391) when a mentor is selected.

Avatar with initials + colored hash, availability badge (green/yellow/red), compensation chip, country flag, expertise paragraph + chip tags, "Startups Worked With" section, LinkedIn button + "🤝 Request Introduction" button with sign-in gate fallback. Clean pattern. When M-01's live-advisor surface ships, it should replicate this layout for consistency.

---

### Cross-cutting (both personas)

#### X-01 · The intro system is the single most leveraged feature — fix it platform-wide
**Severity:** BLOCKER (the most-leveraged single fix across all three personas)

Synthesizing findings I-02, M-05, and the founder audit's mailto-only finding: the intro system is the fundamental value-promise of Founder Ops Center and it's wired to `mailto:` + manual admin attention everywhere. Fixing `sendIntroEmail()` to use `sendAutoEmail()` + adding `sendAutoEmail(RUSSELL_EMAIL, ...)` at request time would:

- Remove Russell as a bottleneck on every intro.
- Give founders/investors/advisors immediate confirmation that their request was received.
- Let Russell respond from anywhere that has his inbox, not just from the admin panel.
- Unlock actual scale beyond Russell-attention-bandwidth.

The Resend edge function at [supabase/functions-backup/functions/send-email/](supabase/functions-backup/functions/send-email/) is already deployed and working (per the 2026-04-17 verification of welcome-email delivery). The machinery exists — it just isn't wired to intros.

**Estimated scope:** 20-30 lines of code across 3 functions (`sendIntroEmail`, `requestIntro`, `submitMentorIntroRequest`), plus email template definitions (~40 lines). Half a day total.

**Impact relative to effort:** likely the highest-leverage single change in the whole punch-list.

---

### Suggested remediation order — updated to cover all three personas

Updated on 2026-04-20 to reflect already-shipped fixes + the new investor/mentor findings. Items marked ✓ are live on prod. Items in brackets are superseded or merged.

1. ✓ **F-16 defensive** — shipped in `c7ecb09`. Re-onboarding no longer wholesale-overwrites.
2. ✓ **F-10 + three sister bugs** — shipped in `2d945b0` (founder connections) and `c7ecb09` (pgAdmin, pgConnections, pgInvestorDashboard).
3. ✓ **F-11 + F-01** — shipped in `2d945b0`. Avatar opens user menu, magic-link users get initials.
4. ✓ **F-02 + F-13 + F-16 root cause** — shipped in `3ecc95e`. Wizard save path and schema drift fixed.
5. ✓ **F-14** — shipped in `2d945b0`. `/#mentors` reaches `pgMentors`.
6. **Next in queue — X-01 (intro email wiring)** — platform-wide, ~20-30 LOC, half a day. Highest-leverage open item.
7. **I-01** — rewire Dashboard "Request Intro" to `requestIntro()`. ~5 LOC. Unblocks investor persona's core promise.
8. **M-01 + M-02** — union live advisors into `pgMentors()` + add Step-2 validation. ~30 LOC. Unblocks advisor persona's core promise.
9. **F-15** — persona-aware sidebar (Mentors nav item for founders; swap Investor Dashboard for Investor Directory on founder side). ~20 LOC.
10. **F-12** — default landing to Action Center for founders with `persona=founder`. ~5 LOC.
11. **F-07 + F-08** — rework Action Center to surface internal platform actions instead of external newsletter signups. Half a day.
12. **M-03** — add advisor-specific Action Center content ("founders who need you"). Quarter day.
13. **I-07** — intro request context note (match mentor pattern). ~15 LOC.
14. **I-06** — move tier-pref check inside `requestIntro`. ~5 LOC.
15. Rest of WEAK + GAP findings as time permits.

---

### Still to audit (unchanged by this addendum)

- Welcome modal (first-run intro)
- Notification bell
- Venture Studio multi-step wizard end-to-end
- Mobile viewport (768×1024 and 375×812)
- All three personas on-mobile

---

## Appendix — evidence sources

- Live site: https://www.founderopscenter.com/
- Commit audited (original founder audit): `6ec275e` on `main`
- Commit audited (2026-04-20 investor/mentor addendum): `402bf20` on `main`
- Primary source file inspected: `/Users/russellcole/Developer/founder-op-center/src/app.js`
- Raw audit notes: `outputs/audit-notes.md` (Claude's working file, not version-controlled)
- Session log: [docs/audit-session-log.md](audit-session-log.md)
- Related open tasks: #32, #33, #34, #35, #36, #37, #44
