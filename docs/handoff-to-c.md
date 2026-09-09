# Family Planner 1.18-beta — Handoff to C

## One-tap personal Home correction — 2026-09-08

Jason clarified that selecting a person is the complete action: immediately stay on that person's
Home, with no required destination choice. The chooser now collapses into a named Home heading
and a Change person action. Reloads preserve both the profile and the collapsed state. All also
completes the selection and restores the family overview. Home tasks, progress and overdue counts
follow the profile; Calendar, Agenda, Chores, Clothing and EHAH follow automatically. Personal
history filters are hidden while an individual is selected, and new clothing/money forms default
to the selected eligible person without changing the owner of existing records.

24 isolated checks passed, including seeded Home tasks, immediate selection without navigation,
reload/deep links, every page's profile, new-entry defaults, All clearing old filters and no JS
errors. No live household records were used. This is browser-local personalization, not a new
authentication or permission system.

## Current navigation revision — 2026-09-08

Jason requested this revision before inviting the kids. This section supersedes the earlier
Money-embedded game, separate game player selector, and Home bank-strip descriptions below.

- Home is the family/task/navigation hub. Five visible buttons select All, Dad, Bella, Abby or
  Ariel from the actual profile list. The existing active-profile key remembers the choice;
  the legacy game choice is a fallback only when that key is absent. No header dropdown.
- Home contains direct Chores and EHAH buttons. Calendar, Agenda and Clothing remain in the main
  navigation. Dollar totals and savings summaries were removed from Home; tasks precede date
  management. Empty Up Next panels no longer occupy space.
- Money is labelled **Chores**; its existing `#funds` link still works. Jobs appear first.
  Balances, money history and parent management controls remain under an expandable section.
- **EHAH** has its own `#ehah` page. Its chooser and Switch player button were removed. It derives
  the helper from Home's selection. All shows the leaderboard and parent review, with a Home link
  for choosing a person; it cannot file a claim. Chores likewise does not pick an arbitrary child
  when All (or an adult without a chore account) is selected.
- One device-local selection is a convenience, not authentication. Scores, cloud transaction
  merging, approvals, reversals and money records retain their existing data semantics.

Verification: 36 isolated Edge checks passed across 320/390/820/1280 widths, including Home,
Chores, EHAH, Calendar and Clothing. Checked deep links/reload, profile propagation, two-tap
logging, All behavior, unchanged financial state, absence of Home dollar totals and no JS errors.
Phone screenshots were visually inspected. Tests used local fixtures with external services
blocked; real family records and live sync permissions were not tested or changed.

## Current state

- Repository: `D:\Integrated Life Solutions\Apps\MM..HOME`  (canonical; moved off OneDrive
  2026-09-04, then out of `D:\dev\family-planner` — see Open items. Older `D:\dev` paths in this
  document's history are historical.)
- Branch: `main`
- Base commit before this Home Crew release: `6908c50a5b6ea420dbada8bec1b44dd505d10ea2`
- Application version: `1.18-beta`
- Clothing policy version: `1.1`
- Funds version: `1.0`
- Home Crew game version: `1.0`
- Production site: <https://scattabraingenius.github.io/family-planner/>
- Home deep links: `#calendar` · `#agenda` · `#funds` · `#clothing`

Untracked items are now governed by `.gitignore` rather than by remembering this
paragraph: `.claude/`, `test-artifacts/`, and `tmp/` are ignored. Everything else in the
working tree is tracked, including the clothing cheat sheets that this document used to
list as uncommitted.

**This repository has two collaborators, not one.** The owner works with both a Claude
session (this document calls it C) and a separate Codex/ChatGPT session against the exact
same local clone. Both write commits under the same local git identity
(`sockopopinski <sockopopinski@gmail.com>`), so `git log --format=%an` cannot tell them
apart — read each commit's actual diff and message before assuming who wrote what. Do not
treat an unfamiliar commit as suspicious or as something to reconcile; check whether it does
what its message says, note it, and move on.

## Recent commits

- `3788dee` — Declutter Home and add the kids' Money page
- `87a5525` — Make the Home dates strip an opt-in shortlist
- `be10291` — Sync deletions, trim the dates strip, make its title editable
- `7bf44e5` — Split Calendar and Agenda into separate destinations
- `3b8270f` — Sync kids schedule across existing family data

## PWA install support (delivered by Codex, 2026-09-04)

`92fae20`. Family Planner is now installable — Android Chrome offers a real Install prompt
instead of Create shortcut, and it launches standalone (no address bar) once installed.

Added: `manifest.webmanifest`, `service-worker.js`, `icons/` (favicon, apple-touch-icon,
192/512/maskable-512 PNGs), and in `index.html` — the manifest link, theme-color and
apple-mobile-web-app meta tags, and a gated service-worker registration.

Deliberately conservative, and worth preserving on any future touch to these files:

- **Firebase, Google Sign-In, and every cross-origin request bypass the cache entirely** —
  the service worker checks `url.origin !== self.location.origin` and returns immediately.
  Auth and live sync must never be served stale.
- **Navigation requests are network-first**, falling back to the cached shell only when the
  fetch fails (offline). A normal deploy is never masked by a stale cache.
- **Service-worker registration is gated** to `https:`, `localhost`, or `127.0.0.1` — opening
  `index.html` straight from disk (`file://`) skips registration entirely rather than
  throwing a console error, preserving the app's original local-only behavior.
- **All manifest paths are relative** (`./`), because GitHub Pages serves this app from
  `/family-planner/`, not from the domain root.

Verified independently (not just re-reporting Codex's own account): manifest and
service-worker both return HTTP 200 from the live site with correct content, the service
worker is registered and controlling the page, `#calendar` still deep-links correctly, and
there are no console errors.

## Navigation (1.17-beta)

One sticky **app bar** lives outside every page wrapper, so it is the same element on Home,
Calendar, Agenda, Money and Clothing. It replaced four separate page headers and three
"Back to Home" buttons — previously Money to Clothing meant going home first.

The bar carries: date, clock, the person selector, the five destinations, and sync state.
Interior pages keep a shared `.pagehead` (title + that page's own actions) and no back button.

- **Routing is table-driven.** `PAGES[]` declares each destination's wrapper, hash, render
  function and optional badge; `showPage(id)` is the only way to change page. Adding a page
  is one row, not four scattered edits.
- **Badges** on Money and Clothing show pending parent approvals. They are deliberately
  **not** narrowed by the person selector — a parent must see outstanding work regardless of
  who is being viewed. The approval queues themselves follow the same rule.
- **The person selector is app-wide.** It scopes what BELONGS to a person — their Home, their
  bank account, history and stats, their clothing wallet and purchases — through
  `scopeTo(list)`, which returns `null` when Everyone is selected or when the selected person
  has nothing in that module (Dad has no clothing wallet). Calendar's duplicate person chips
  were removed; `calState.person` now simply mirrors `activePerson`.
- **On phones** the bar wraps to three rows with icon-over-label buttons, then condenses to
  just the nav row (~59px, down from ~143px) once the page has scrolled. Desktop is a flat
  60px and never condenses.
- **The condense thresholds are measured at runtime, and must never be hard-coded.** The bar
  is `position:sticky`, so it is *in flow*: condensing it shortens the document by the height
  it gives up, and the browser's scroll anchoring then moves `scrollY` by that same amount to
  keep the visible content still. If the expand and condense thresholds sit closer together
  than that shift, every toggle lands past the opposite threshold and the two states chase
  each other at 60fps. That shipped in 1.17-beta and was reported as the page "spazzing out"
  while scrolling: with an 84px bar delta and a 20/60 gap it ran
  `100 -> condense -> 16 -> expand -> 100 -> ...` forever, trapping the scroll wherever the
  user stopped inside the band. `measureBarCondenseDelta()` now reads the real height
  difference and sets the condense threshold to `expand + delta + 24`, re-measuring on resize
  because the delta depends on how the nav wraps and is 0 above the 820px breakpoint.
- `history.replaceState`, not `pushState`: tapping through the bar must not stack up
  back-button history.
- `renderAppNav()` rebuilds only when its content signature changes, so a render triggered by
  a cloud update never yanks focus out of a nav button.

## Home (1.16-beta)

Home was decluttered rather than redesigned. What was removed and why:

- The `Home` page title — decoration on a page you are already looking at. The weekday is
  now the headline, with the full date and the clock beside it as one header strip.
- The person chip row — one control per family member, growing with the family. It is now a
  single dropdown **inside the header strip**, so it costs no vertical space. `Edit family…`
  is its last option rather than a separate button.
- The search box — hidden, not deleted, the same treatment Quick Notes and Before You Leave
  received in 1.13-beta. `currentView()` still reads it, so restoring it is one attribute.
- The Places to Go panel — hidden. **The data is untouched and still feeds Calendar, Agenda
  and Print Center.**

What was added:

- **Goals for today**, with a live countdown to an end-of-day time that is editable in the
  panel and synced as a household rule (`dayPlan.dayEndTime`, default `20:30`). Goals are
  deliberately not a task status: they never touch the progress bar or Up Next, and rows
  older than 14 days are pruned on load.
- **Per-child status cards**, a read-only mirror of the Money page: balance, what is left
  today, goals, anything awaiting parent approval, and savings-goal progress. Tapping a card
  focuses Home on that child; tapping it again returns to Everyone.

Selecting a child narrows Home to them — tasks, goals, dates, countdowns, status card — and
greets them by name. Unassigned and `family` items stay visible to everyone. **View all
dates deliberately stays unfiltered** so nothing becomes unreachable behind a filter. The
selection is device-local (`saveActiveProfile`), so each child's phone opens on them.

## Money (new in 1.16-beta)

Replaces the abandoned Chore-Bot subscription. Per child: balance, weekly allowance, savings
goal, and a job menu.

- **Jobs.** A child taps a job when it is done, which files a request. A parent approves it,
  and approval is the moment the money becomes real. Pending rows never count toward a
  balance. The amount is captured when the job is done, so re-pricing a job later never
  rewrites already-finished work.
- **Allowance.** Deposited automatically on its weekday by whichever device opens the app
  first. Row ids are deterministic (`allowance:<person>:<payday>`), so devices racing to
  create one produce a single row rather than a double payment. **Missed weeks are never
  backfilled** — money that was not tracked was not paid.
- **Ledger.** Signed cents; balance is always recomputed, never stored. Linked clothing rows
  refuse deletion from the bank side rather than silently disagreeing with Clothing.

### The Clothing bridge

Clothing keeps two deliberately separate quantities, so the bank talks to each on its own
terms rather than through one generic transfer:

| Clothing quantity | Means | Bank action |
|---|---|---|
| `clothingWalletLedger` | Subsidy budget remaining | Top up with the child's own money |
| Settlement balance | Real cash owed between two people | Pay a bill, or collect what is owed back |

Every transfer writes **both halves under one `linkId`** and saves both modules together.
There is no wallet-to-bank direction on purpose: wallet money is a clothing-only subsidy, and
converting it back to spendable cash would defeat the point of the budget.

One currency, real dollars, shared with Clothing — never points. The product charter rules
out a parallel reward currency, and Money stays on the right side of that line only as long
as there is exactly one currency in the app.

## Everything Has a Home — the Home Crew game (new in 1.18-beta)

A points-only cleanup game, living as a section at the TOP of the Money page. Put away something
another player left out and you gain a point; the person who left it loses one. Dad plays.

**It is points only, and it is fenced off from the money on purpose.** Nothing in it reads or writes
`fundsLedger`, a balance, an allowance, a job payout, the clothing wallet or a settlement. Game
points cannot be spent or converted. The narrow, dated exception to the charter's "no parallel
reward currency" refusal is written into `docs/product-charter.md`; read it before extending this.
Any future payout would be a separate decision needing deterministic one-time award ids and the
existing signed-cents ledger.

- **One record per claim, and the score is derived from it.** `homeGameEvents` rows carry a stable
  id, helper id, owner id (`""` = unknown), category, round, date, created/updated, status
  (`pending` / `confirmed` / `declined`), reviewer, decision time, and a reversal flag. Scores are
  recomputed from confirmed, non-reversed events on every read. **There is no stored total.** That
  is what makes approving the same claim twice, or the same claim arriving from two phones,
  incapable of moving a score twice — and it is why confirming can never apply the +1 without the
  −1, because both halves are one reading of one status.
- **Two taps.** Category, then whose it was, and it sends. No submit button. The player is never
  offered as the owner of their own claim. "Not sure" files the claim with no owner: the helper is
  credited and nobody is deducted.
- **Duplicate guard.** The same helper, owner and category already pending is refused with a
  message rather than filed — that pattern is a double tap or a second phone, not two rescues.
- **Everything is reversible.** Confirm, decline, take back a confirmed claim (both scores restore
  together), put a reversal back, reopen a declined claim. Nothing is ever deleted; a reversal is a
  state on the event.
- **Rounds.** One week, starting Sunday, keyed by that Sunday's date. A new week is a fresh
  leaderboard; old events keep their own round key and stay in history. Ties share a rank.
- **The remembered player is device-local.** `home.homeGamePlayer.v1` stores a stable profile id
  the same way `home.activeProfile.v1` stores the active family filter — never synced, so each
  kid's phone opens straight onto them with the chooser hidden. "Switch player" sits at the bottom.
  A saved id that no longer matches a real player falls back to the chooser. A browser that blocks
  storage still plays and says the choice will not be kept.
  **It is deliberately NOT the app-wide person selector**, and it is not authentication: whoever
  holds the phone can change it, so it proves nothing and grants nothing.
- **Claims MERGE on sync; they are the only collection here that does.** Every other list is edited
  by a parent on one device at a time, but four people log cleanups on four phones, often offline.
  `mergeHomeGameEvents()` unions by id, comparing causal revision, then update time, then
  canonical content for deterministic simultaneous-edit ties. Game events use a Firebase child
  transaction that merges against server data on retries; they are excluded from whole-planner
  updates. Game actions write only the two game collections. Older imports merge rather than
  replacing newer decisions. Conflicting simultaneous decisions converge to one result; they do
  not represent an authenticated parent audit trail.
- **The Money nav badge now counts both** job payouts and cleanup claims waiting for a parent. Like
  every other badge it is never narrowed by the person selector.
- **Parent review sits outside the player/chooser switch**, so a parent who has never picked a
  player can still confirm the claims the badge is counting.
- **Icons are inline SVG defined in `HG_ICONS` in `index.html`.** The design preview used Lucide
  supplied by the Codex conversation host; production must never depend on that. There is no CDN
  request, no third-party asset, and they work offline and in the installed PWA. `service-worker.js`
  and `manifest.webmanifest` were not touched.
- **Animation is a short CSS pop plus ten sparks**, skipped entirely under
  `prefers-reduced-motion: reduce`. It says *your claim was sent*, which is deliberately not the
  same thing as *you were given a point* — the point only exists once a parent confirms it, and the
  leaderboard is what shows that. Nothing is communicated by motion alone.

## Clothing feature summary

The Clothing page provides:

- Per-child wallet cards and monthly deposits
- Auditable wallet ledger rather than a mutable balance
- Deal calculator and new-purchase workflow
- Necessary and discretionary purchase lanes
- Verified-retail approval workflow
- Category caps
- Deal Match, Intentional Purchase, and Training Wheels modes
- Purchase history, returns, archiving, correction entries, and deletion tombstones
- Parent overrides with explanations
- Reimbursement settlement, separate from the wallet ledger
- Clothing summary in Print Center
- Local storage, Firebase synchronization, import/export, normalization, migration, and missing-collection guards
- Direct `#clothing` routing

Canonical requirements are in `docs/clothing-deal-match-system.md`. Scope and refusals are in
`docs/product-charter.md`.

## Current policy decisions

- Clothing is for children only. Household members using adult role labels such as Dad, Daddy, Mom, Nana, Grandma, or Grandpa are excluded from clothing wallets, deposits, choices, settings, totals, verification queues, and printing.
- Money accounts follow the same rule and the same explicit per-person override.
- Existing adult clothing ledger or purchase records are preserved for audit but hidden from the active Clothing interface.
- Parent pays all tax.
- Child pays all standard and expedited shipping.
- Displayed purchase total includes item price, tax, and shipping.
- Shipping greater than the item price is blocked unless a parent supplies an override explanation.
- The calculator encourages free shipping or pickup.
- Historical purchases retain their saved policy snapshots. Current policy changes do not rewrite them.
- Each receipt item is calculated separately.
- A wallet top-up from the bank counts toward the wallet maximum, which can reduce the next monthly parent deposit. The transfer modal states this rather than hiding it.

## Storage and synchronization

Dedicated local-storage keys:

- `home.clothingPurchases.v1`
- `home.clothingWalletLedger.v1`
- `home.clothingSettings.v1`
- `home.clothingSettlements.v1`
- `home.fundsLedger.v1`
- `home.fundsSettings.v1`
- `home.goals.v1`
- `home.dayPlan.v1`
- `home.homeGame.v1`
- `home.homeGameSettings.v1`

Firebase collections:

- `clothingPurchases`, `clothingWalletLedger`, `clothingSettings`, `clothingSettlements`
- `fundsLedger`, `fundsSettings`, `goals`, `dayPlan`
- `homeGameEvents`, `homeGameSettings`

Planner writes use `db.update`, not root `db.set`; game events use a child transaction. Older snapshots and imports that omit a
collection must not erase current data; `payloadV: 2` marks a writer that always sends every
collection, so for those payloads an absent array genuinely means empty.

Device-local and deliberately never synced: `home.settings.v1`, `home.viewprefs.v1`,
`home.activeProfile.v1`, `home.calendarPrefs.v1`, `home.homeGamePlayer.v1`.

## Security note

The front end is publicly hosted on GitHub Pages and connects directly to Firebase Realtime Database. The parent-approval UI in both Clothing and Money is a household workflow, not authentication or genuine access control. Do not describe hidden client controls as security. Firebase Database Rules are not present in this repository and should be reviewed separately before treating clothing or money records as private.

## Testing completed

- Home, Money, and the Clothing bridge were exercised in an isolated preview with Firebase offline. No console errors.
- Clothing bridge verified to the cent in both directions: $25.00 owed → paid from bank → settlement $0.00; $60.00 credit → collected into bank → settlement $0.00.
- Job request → parent approval → balance change verified; pending rows confirmed not to move a balance.
- Person focus verified through the real control: selecting a child filters the task list, goals, status cards and countdowns, and restores correctly.
- Earlier clothing verification still stands: a $5.00 item + $0.50 tax + $20.00 shipping produces a $25.50 total, $3.00 parent total, and $22.50 child total; shipping-over-item-price blocks completion without a parent override reason.

Everything Has a Home was verified on 2026-09-08 with two headless browser runs against the local
file, with Firebase and every cross-origin request blocked so nothing could reach the family's
database and no sign-in ever happened. 29 checks passed and no runtime or console errors were
raised. Covered: the real seeded profile ids; first-visit chooser; the chooser collapsing after a
choice; the remembered player surviving reload and being stored as a stable profile id; switching
and cancelling a switch; an unknown saved profile falling back to the chooser; the owner step
excluding the player; two-tap entry leaving both scores untouched while pending; the duplicate
pending guard; confirmation applying +1/−1 together; repeated approval of the same claim being
incapable of a second point; reversal restoring both sides, being itself reversible, and never
deleting the record; declines moving no score and being reopenable; unknown owner crediting the
helper with no deduction anywhere; ties sharing a rank; game records surviving reload with scores
rebuilt from them; the Money badge counting waiting claims; Dad scoring without gaining a bank
account or clothing participation; no horizontal overflow at 320/390/736px; reduced motion emitting
no sparks while still stating the result in text; a storage-blocked browser still playing and
saying so. On the sync path specifically: the real `pushCloud` payload carrying both new
collections alongside every existing one; a snapshot written before a local claim keeping both
devices' claims; a decision made on another device arriving and scoring both sides; a stale copy
arriving late being unable to un-confirm; a reversal surviving synchronisation; and the real Export
file carrying the claims, their decisions and their reversals.

The strongest money check is a byte-for-byte one: `fundsLedger`, `fundsSettings`,
`clothingPurchases`, `clothingWalletLedger`, `clothingSettings`, `clothingSettlements` and every
balance were captured before play and compared after a full session of logging, confirming,
declining, reversing and restoring. They were identical.

Do not test financial mutations against live Firebase data.

## Miss Chief release review — 2026-09-08

Reviewed C's completed implementation and corrected the whole-array concurrent-write risk using
server-side transactions. Added causal revisions and deterministic conflict resolution, preserved
newer reversals during import, separated game writes from financial collections, added visible
sync-failure feedback, and restored spacing between the personal game panels.

Independent isolated Edge verification: **30 checks passed**, no JavaScript errors. Covered real
two-tap UI entry, remembered/switchable player, paired scoring/undo, duplicate approval, unknown
owner, weekly round, unchanged financial state, transaction retry against an existing remote claim,
write failure feedback, backward clocks and equal-time conflicts, real import/export preserving
reversals, and widths 360/390/820/1280. The phone layout was also visually inspected. External
requests were blocked and no production records were changed. The transaction test used a local
server double; it does not establish live Firebase permission or real-device acceptance.

Release scope is the three files in this commit: `index.html` and the two product/handoff documents.
Jason authorized the normal main-branch push after review. Actual deployment outcome is recorded
in the Obsidian plan; the family pilot and live cross-phone sync check follow publication.

## Open items

- **Firebase Database Rules have never been reviewed and are not in this repository.** Money
  adds four new top-level keys, and the Home Crew game adds two more (`homeGameEvents`,
  `homeGameSettings`). If the rules whitelist keys rather than allowing the family
  node, those writes may be rejected. Home Crew now displays a game-sync warning on write
  failure; reconnect or reload to retry. Live rules and real two-phone sync remain unverified.
- **The Home Crew pilot has not been played by the family yet, and no reward decision has been
  made.** Run it for a few days, then review actual activity before deciding whether points ever
  acquire a value. Categories are the four agreed ones; each item's real home still needs settling
  together, and the grace period before an abandoned item counts is still undecided — the app
  records claims, it does not adjudicate them. Watch for blaming, staged messes, or a kid opting
  out: a proposed response is to keep helper points and drop the deduction, subject to Jason
  deciding after the pilot. This is a recommendation, not an agreed rule change.
- Starting balances have not been entered. The Money page ships empty by design — no balance
  was invented, because the real Chore-Bot figures are not known to the app.
- Job prices are placeholders ($1–$5) and need setting to real household values.
- Ariel's person colour is amber, the same colour as the "needs approval" card border, so her
  card always reads slightly like an alert. Cosmetic; if it misleads in practice, change the
  approval cue to something other than colour.
- The person dropdown wraps to its own line below ~420px, because the date, clock and picker
  cannot fit across a phone. Still tighter than the bar it replaced. Dropping the clock's
  seconds or shortening the date format would recover it.
- Open charter questions remain: confirm the operator/reader split, and decide whether the
  Today column becomes a true time-gutter timeline.
- **The repository moved out of OneDrive on 2026-09-04.** OneDrive was syncing the Git object
  store and dehydrating objects into cloud placeholders; three became unreadable and a push
  failed. The old copy carries a `_MOVED-DO-NOT-EDIT.md` marker and can be deleted. Never put
  this repository back inside a folder another sync client manages.

## Constraints for the next minor changes

- Use the current `index.html` as the only application base.
- Preserve all existing Calendar, Important Dates, RCS school-calendar, tasks, Places, Shopping, Edit Family, inline-editing, Firebase, import/export, printing, mobile, and deep-link behavior.
- Do not copy from `Home_1.5.html` or `index-v1.4-fixed-backup.html`.
- Do not rename existing local-storage keys.
- Resolve current records by ID at commit time and preserve unrelated newer fields.
- Defer disruptive Firebase renders while an editor is active (`editingActive()`), and patch text in place for anything that ticks every second.
- Do not write text to Firebase on every keystroke.
- Make financial changes auditable and preserve historical policy snapshots.
- Keep Money and Clothing on one currency. A second currency reopens a settled charter refusal.
- The Home Crew game's points are the one documented exception, and they are unspendable. Never
  connect them to `fundsLedger`, a balance, an allowance or the clothing wallet, and never derive a
  score from anything but the event list. Re-read the exception in `docs/product-charter.md` before
  extending the game.
- Unless explicitly requested, do not change the application version for minor corrections.
- Review the exact staged files before committing or pushing.

## Note on this document

It went stale between 1.13-beta and 1.16-beta — it still listed an already-fixed clothing
mode bug as the next thing to do, and described committed files as uncommitted. A handoff
that is wrong is worse than none. Update it in the same commit as the work it describes, or
delete it.

## Welcome block clearance — 2026-09-08

Jason clarified via screenshot that the entire named-Home heading and shortcut block must clear after choosing a person. Both sections now hide together; Change person lives in Home tools and reopens the chooser. Top navigation retains EHAH and Chores. 26 isolated checks passed, including whole-block clearance, remembered selection and all page defaults. This supersedes the retained named-Home heading described above.

## EHAH bulk entry — 2026-09-08

Jason requested bulk entry after putting away 35 things. Bulk add opens an owner/category quantity
grid using the remembered Home person as helper. Fill only relevant counts, send once. Each cell
creates one pending quantity-bearing claim, so one approval or reversal covers that group.
Known owners lose the same quantity; unknown ownership has no deduction. Scores/rescue counts
sum quantities, and old events migrate to quantity 1. Quantities travel through existing event
sync/import/export. Whole numbers 1–9999 are accepted; validation precedes any save. Bulk entry
can record additional items alongside pending claims; users are told to enter only unlogged items.
Submit closes the form and disables duplicate submission; Cancel saves nothing. Single-item entry
retains its existing duplicate guard. Reload older app tabs so they display quantity-aware scores.

19 isolated checks passed: 35 items split across owners, group approval/undo/restore, persistence,
legacy migration, unknown owner, invalid counts, merge quantity preservation, unchanged financial
state, cancel and modal fit at 320/390/820. Phone screenshot inspected; no JS errors or production
household-data writes during testing.

## Repeated cleanups, parent entry and stale launch — 1.19-beta

Jason clarified that pending claims must never block more cleanups. Removed the same-helper,
owner/category pending gate from single entry and reopening. Every deliberate two-tap entry is
its own claim; bulk batches can also accumulate. Children remain pending until later review.
Dad/Daddy and other existing adult household role names now create confirmed game claims directly,
including bulk quantities, with normal reversible review history. This is the app's existing name
convention, not secure role enforcement. Existing pending claims are not retroactively approved.

Phone screenshots showed the old Today/Money/dropdown layout; current root and index URLs both
served EHAH. Updated the service-worker shell to v3, revalidate navigation against HTTP cache,
bypass cached worker checks, and added Update app under Home tools. Saved profile/data storage
is not cleared. Fresh launch link: index.html?refresh=1.19#ehah. Physical iPhone state remains
unverified; the fresh link is the recovery path for an old open tab.

Verified in isolated Edge: 42 repeated child cleanups plus a 35-item batch remain pending,
parent direct/bulk credit, later child review, paired undo, unchanged financial state, 26 existing
profile checks, and actual local service-worker v2-to-v3 upgrade with local storage preserved,
unrelated caches retained and the updated app launching offline. No production records modified.
