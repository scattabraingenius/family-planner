# Family Planner — Product Charter

The reference document for deciding what this app is, what belongs in it, and where new things live.
Written before further feature work, so features stop being built on instinct and torn out later.

Status of each item below is marked **[decided]**, **[provisional]**, or **[open]**.

## Identity

**[decided]** Family Planner is a parent-operated household command center. It turns the family's
schedule and responsibilities into clear shared actions, and gives children structured ways to take
some of it on themselves.

The spine is **daily coordination** — the schedule, who's responsible for what, what's coming up.
That is what gets opened every day.

The **Clothing** module is not the spine. It is the depth standard: the one module that already has a
real recurring problem, explicit rules, named participants, parent and child responsibilities,
decisions the app makes easier, and output worth printing and discussing. Every future module should
be that well-defined before it ships. Nothing gets built to a lower bar.

## Who uses it

- **One operator (parent).** Nearly all data entry, all approvals, all configuration.
- **Three children (readers).** They open it on phones to see what's happening, what's expected of
  them, and where their clothing wallet stands. They are not primary editors. **[provisional —
  confirm]**

Consequences if the above holds:

- No authentication, accounts, or per-user sessions. There is no "current user" concept to build.
- Mobile read layouts are a first-class surface, not a courtesy. Half the audience only ever sees
  the app at ~390px.
- Parent-only controls stay a household convention, not enforced access control (see Non-goals).

## What Home must answer in five seconds

Home earns its space by answering these, in roughly this order:

1. What is happening today, and who is it for?
2. Is anything overdue or about to be missed?
3. What is the next thing, and when?
4. Is anything unusual coming — no school, half day, travel?
5. Does anyone need to buy something?

If a panel on Home does not help answer one of those, it does not belong on Home.

**The layout rule:** Home shows summaries and immediate actions. Dedicated pages hold complete tools.

## Feature test

Every proposed feature must answer all six before any code is written:

1. What recurring household problem does it solve?
2. Who uses it, and how often?
3. Does it reduce parental mental load, or build child responsibility? (One of the two is required.)
4. What happens if it does not exist?
5. Does it belong on Home, on a dedicated page, or outside this app entirely?
6. Are we willing to maintain its data, rules, and migrations long-term?

Worked results:

- **Clothing** — passes on every count.
- **Calendar / Important Dates / Tasks** — pass; they are the spine.
- **Shopping** — passes, as a Home summary (question 5 of the five-second list).
- **Places** — passes on coordination value and because dated Places feed Calendar, but it does not
  need premium Home real estate.
- **Quick Notes** — fails 1, 2, and 4. It was a text box that might be handy. Hidden in 1.13-beta.
- **Before You Leave** — fails 2 and 4. Built, simplified once, then unused. Hidden in 1.13-beta.

## Non-goals

Explicitly out of scope. These are refusals, not backlog items — revisiting one requires revisiting
this charter.

- **Meal planning.** Every competitor has it. It has never come up as a real need here. Building it
  because others have it is exactly the Quick Notes mistake.
- **Chores with points/rewards currency.** Clothing already teaches responsibility through money
  with real stakes. A second parallel reward currency would compete with it and dilute both.
- **Freeform note-taking.** Already tried and failed once. Do not rebuild it under a new name.
- **Document/file storage, expense splitting, general household budgeting.** Clothing is a scoped
  teaching tool, not an accounting system. Do not let it grow into one.
- **Smart home / device control.**
- **Anything requiring real privacy or secrecy.** The app is publicly hosted on GitHub Pages with a
  client-side Firebase connection and no authentication. Parent controls are a household workflow,
  not security. Do not store anything in it that would matter if a stranger read it.

"Put everything in one system" means everything belonging to *this* job — coordination and
responsibility. It does not mean every household fact.

## Page map

Current pages that work and stay: **Home** · **Calendar** · **Clothing**

Eventual target, adopted as direction rather than an immediate refactor:

| Area | Holds |
|---|---|
| Today (Home) | Today's schedule, active tasks, next events, unusual-day flags, shopping summary |
| Calendar | Full planning surface — agenda and month, school calendar |
| Lists | Shopping, Places, and any future list that passes the feature test |
| Clothing | Wallets, purchases, verification queue, per-child status |
| Family | Profiles, colors, school info, per-child settings |
| Utilities | Print Center, import/export, sync status, policy settings |

**Do not perform this reorganization now.** Family, Lists, and Utilities currently exist as an inline
panel, a sidebar, and a modal, and all three work. Splitting them out today would be exactly the
teardown-and-rebuild cycle this charter exists to prevent. Split a page out when it actually gets
crowded, not on schedule.

The one early rename worth doing: **Home → Today**, because it tells you what is allowed to live
there. Cheap, and it enforces the five-second list.

## Design references

Structure and constraints come first; visual polish second.

- **[Ohana Wall](https://www.ohanawall.com/)** — primary structural reference. Browser-based, runs on
  devices you already own, no dedicated hardware. Same constraints as this app. Its layout is already
  close to Home: person filter chips over a day column, compact summary cards with count badges in a
  sidebar. Worth stealing: its Today column is a **time-ordered timeline with an explicit time
  gutter**, which shows gaps in the day rather than just ordering.
- **[Hearth](https://hearthdisplay.com/pages/features)** — polish and family-product maturity
  reference. Treat with care: it is a fixed wall display designed for far viewing. Do not adopt a
  layout that assumes screen space this app does not have.
- **Home Assistant dashboards** — closest match to the existing dark, card-based aesthetic, and the
  source of the layout discipline above:
  [Lovelace design examples](https://homeautomationworkshop.com/home-assistant-dashboard-ideas-beautiful-lovelace-designs/)
  · [layout guidance](https://www.smarthomeautomate.com/learn/home-assistant-dashboard-design)
  (organize by purpose, not data type; keep secondary tools off the main view; reveal conditionally).
- Also useful: [FamilyDash](https://familydash.app/) · [Domus](https://trydomus.app/) ·
  [Skylight](https://myskylight.com/calendar/) · [DAKboard](https://dakboard.com/c/family/) ·
  [Sunsama](https://www.sunsama.com/) (day-planning interactions) ·
  [Dribbble family-organizer](https://dribbble.com/tags/family-organizer) (mood board only).

## Open questions

- **[provisional]** Confirm the operator/reader split above. Everything in "Consequences" depends on it.
- **[open]** Does the Today column become a true time-gutter timeline, or stay a sorted list?
- **[open]** Firebase Database Rules have never been reviewed and are not in this repository. Until
  they are, treat the Non-goals privacy constraint as binding.
- **[open]** Should Places lose its Home slot and move to Lists, keeping only dated Places visible
  via Calendar?

## Change log

- 2026-08-08 — Initial charter. Written after hiding Quick Notes and Before You Leave, and after
  comparing against Ohana Wall, Hearth, and Home Assistant dashboard practice.
