# Family Planner 1.17-beta — Handoff to C

## Current state

- Repository: `D:\dev\family-planner`  (moved off OneDrive 2026-09-04 — see Open items)
- Branch: `main`
- Current HEAD: `3788deeb6239fa7597a6ab00fd486b76ed1ac46a`
- Application version: `1.17-beta`
- Clothing policy version: `1.1`
- Funds version: `1.0`
- Production site: <https://scattabraingenius.github.io/family-planner/>
- Home deep links: `#calendar` · `#agenda` · `#funds` · `#clothing`

Untracked items are now governed by `.gitignore` rather than by remembering this
paragraph: `.claude/`, `test-artifacts/`, and `tmp/` are ignored. Everything else in the
working tree is tracked, including the clothing cheat sheets that this document used to
list as uncommitted.

## Recent commits

- `3788dee` — Declutter Home and add the kids' Money page
- `87a5525` — Make the Home dates strip an opt-in shortlist
- `be10291` — Sync deletions, trim the dates strip, make its title editable
- `7bf44e5` — Split Calendar and Agenda into separate destinations
- `3b8270f` — Sync kids schedule across existing family data

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
  just the nav row (~59px, down from ~143px) once the page scrolls past 60px, with a
  hysteresis gap so it cannot flicker. Desktop is a flat 60px and never condenses.
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

Firebase collections:

- `clothingPurchases`, `clothingWalletLedger`, `clothingSettings`, `clothingSettlements`
- `fundsLedger`, `fundsSettings`, `goals`, `dayPlan`

Firebase writes use `db.update`, not root `db.set`. Older snapshots and imports that omit a
collection must not erase current data; `payloadV: 2` marks a writer that always sends every
collection, so for those payloads an absent array genuinely means empty.

Device-local and deliberately never synced: `home.settings.v1`, `home.viewprefs.v1`,
`home.activeProfile.v1`, `home.calendarPrefs.v1`.

## Security note

The front end is publicly hosted on GitHub Pages and connects directly to Firebase Realtime Database. The parent-approval UI in both Clothing and Money is a household workflow, not authentication or genuine access control. Do not describe hidden client controls as security. Firebase Database Rules are not present in this repository and should be reviewed separately before treating clothing or money records as private.

## Testing completed

- Home, Money, and the Clothing bridge were exercised in an isolated preview with Firebase offline. No console errors.
- Clothing bridge verified to the cent in both directions: $25.00 owed → paid from bank → settlement $0.00; $60.00 credit → collected into bank → settlement $0.00.
- Job request → parent approval → balance change verified; pending rows confirmed not to move a balance.
- Person focus verified through the real control: selecting a child filters the task list, goals, status cards and countdowns, and restores correctly.
- Earlier clothing verification still stands: a $5.00 item + $0.50 tax + $20.00 shipping produces a $25.50 total, $3.00 parent total, and $22.50 child total; shipping-over-item-price blocks completion without a parent override reason.

Do not test financial mutations against live Firebase data.

## Open items

- **Firebase Database Rules have never been reviewed and are not in this repository.** Money
  adds four new top-level keys. If the rules whitelist keys rather than allowing the family
  node, those writes will be rejected and Money will silently stay device-local. Symptom:
  tasks sync between phones but money does not.
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
- Unless explicitly requested, do not change the application version for minor corrections.
- Review the exact staged files before committing or pushing.

## Note on this document

It went stale between 1.13-beta and 1.16-beta — it still listed an already-fixed clothing
mode bug as the next thing to do, and described committed files as uncommitted. A handoff
that is wrong is worse than none. Update it in the same commit as the work it describes, or
delete it.
