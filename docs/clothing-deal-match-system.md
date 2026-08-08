# Clothing Deal-Match System

## Goal

Add a clothing calculator and purchase tracker that teaches children to shop intentionally and find real deals.

The parent contribution toward discretionary clothing increases when a child finds a verified discount, while:

- A replenishing wallet limits total parent spending.
- Category caps prevent designer pricing from inflating the contribution.
- Necessary clothing remains the parent’s responsibility within reasonable limits.
- Each child can have developmentally appropriate guardrails.
- The calculator recommends; the parent can override.

## User contexts

### Deal Match user

- May prefer premium or designer clothing and spend more of their own money.
- Already looks for discounts and benefits from a transparent formula that rewards verified deals.
- Primary use case for the Deal Match formula.

### Intentional Purchase user

- Has a narrow personal style and may reject otherwise practical purchases.
- Benefits from an accumulating wallet and short reflection prompts rather than requirements to browse extensively.
- Needs help connecting each purchase to likely outfits, replacement needs, and return deadlines.

### Training Wheels user

- Enjoys shopping but is still developing an understanding that money is finite.
- Benefits from a highly visible balance, projected remaining balance, parent approval, and a cooling-off period.
- May not borrow from future deposits; non-clothing purchases remain outside the clothing wallet.

Fairness means the same transparent opportunity and structure, not necessarily identical outcomes or identical guardrails.

## Two purchase lanes

Every purchase defaults to discretionary.

Only a parent may mark a purchase necessary.

Necessary examples:

- Replacing something outgrown, damaged, or unusable
- Filling a genuine wardrobe shortage
- School-required clothing
- Weather-required clothing
- Sports-required clothing
- Parent-approved event clothing

Discretionary examples:

- Additional designer items
- Extra shoes when enough usable shoes already exist
- Brand upgrades
- Replacing usable clothing because of boredom
- Extra clothing in an already well-supplied category
- Items unlikely to be worn

Necessary calculation:

```text
EligiblePrice = minimum of PricePaid and CategoryCap
ParentContribution = EligiblePrice
ChildPays = PricePaid minus ParentContribution
```

Necessary purchases do not consume the discretionary wallet.

## Discretionary wallet

Starting defaults:

- Monthly deposit: $50 per child
- Maximum wallet balance: $150
- Unused balance rolls over
- No borrowing from future deposits
- Deposit and maximum are configurable per child
- Parent may make a manual adjustment with a required note

Monthly accumulation:

```text
NewBalance = minimum of CurrentBalance plus MonthlyDeposit, MaximumWalletBalance
```

Do not implement this as only a mutable balance. Use an auditable wallet ledger.

Ledger entry fields should include:

- `id`
- `personId`
- `date`
- `type`
- `amount`
- `purchaseId` when applicable
- `periodKey` when applicable
- `description`
- `parentNote`
- `created`
- `updated`

Ledger types:

- `opening-balance`
- `monthly-deposit`
- `purchase-contribution`
- `refund`
- `manual-adjustment`
- `correction`

Displayed balance is calculated from ledger entries.

## Idempotent monthly deposits

Opening, refreshing, rendering, or synchronizing the app must never duplicate a monthly deposit.

Use a stable period key equivalent to:

```text
clothing-deposit:PERSON_ID:YYYY-MM
```

Before depositing, check whether that period key already exists for that person.

```text
ActualDeposit = minimum of MonthlyDeposit and MaximumBalance minus CurrentBalance
```

Record the actual amount deposited, including zero when useful for audit, but do not create repeated zero entries.

Treat calendar months as local months, not UTC months.

## Verified retail

`VerifiedRetail` means the normal selling price of the exact item, not automatically the largest number printed on a tag.

Acceptable proof:

- Screenshot of the same item before the discount
- Same SKU currently listed at its normal price
- Receipt showing regular price and discount
- Manufacturer’s current listed price
- Parent-approved tag photo

Store:

- `claimedRetailPrice`
- `verifiedRetailPrice`
- `verificationMethod`
- `verificationUrl`
- `verificationNote`
- `verificationStatus`
- `verifiedBy`
- `verifiedAt`

Verification statuses:

- `unverified`
- `parent-approved`
- `parent-corrected`
- `rejected`

Do not store images or screenshots as base64 in localStorage or Firebase Realtime Database. Version one stores only a URL, method, note, and approval metadata.

Outlet “compare at” prices require parent approval.

If `verifiedRetailPrice` is absent, zero, invalid, or not parent-approved:

```text
Discount = 0
```

Otherwise:

```text
Discount = clamp((VerifiedRetail - PricePaid) / VerifiedRetail, 0, 1)
```

## Deal-Match formula

Starting defaults:

- Baseline parent percentage: 50%
- Ceiling parent percentage: 95%

```text
ParentPayPercent = Baseline + (Ceiling - Baseline) * Discount
EligiblePrice = minimum of PricePaid and CategoryCap
CalculatedContribution = ParentPayPercent * EligiblePrice
ActualParentContribution = minimum of CalculatedContribution and CurrentWalletBalance
ChildPays = PricePaid - ActualParentContribution
```

Subtract `ActualParentContribution` from the child’s wallet through one `purchase-contribution` ledger entry.

All percentages must be stored consistently.

Round monetary values only at final currency boundaries to two decimal places. Use integer cents internally when practical to prevent floating-point drift.

## Secondhand rule

Avoid double-rewarding the same discount.

If original retail is verified:

- Use the normal Deal Match formula.
- Do not add a secondhand bonus.

If original retail cannot be verified:

- `Discount = 0`.
- Add a fixed 15 percentage points to `ParentPayPercent`.
- Never exceed the configured ceiling.

Record whether the item is:

- `new`
- `outlet`
- `clearance`
- `secondhand`

Never use collector or resale-market value as `VerifiedRetail`.

## Category caps

Starting defaults, globally editable and overridable per purchase:

- T-shirt/tank: $30
- Blouse/specialty top: $45
- Sweater/hoodie: $60
- Shorts/skirt: $50
- Pants/jeans: $75
- Dress: $85
- Everyday shoes: $100
- Athletic shoes: $125
- Boots: $125
- Coat/jacket: $150
- Accessories: $30
- Formal/special-event clothing: parent enters the cap

Category caps limit the eligible portion of the parent contribution. They do not limit how much of the child’s own money may be spent.

The child pays:

- Their calculated share of the eligible portion
- Every dollar above the category cap

## Per-child modes and guardrails

Support configurable modes without hard-coding behavior to age.

### Deal Match mode

- Full discount formula
- Intended for children ready to evaluate and verify discounts

### Intentional Purchase mode

- Same wallet
- Optional reflection prompts
- Intended for children who benefit from structured purchase reflection

Prompts:

- Does this fit your current style?
- What will you wear it with?
- Name two or three outfits it completes.
- Is it replacing something or adding something?
- Did you try it on?
- What is the return deadline?
- Did you compare at least two options, online or in-store?

### Training Wheels mode

- Same wallet structure
- Parent approval required
- Configurable fixed parent percentage instead of Deal Match
- Default 24-hour cooling-off period for discretionary purchases
- Always show projected remaining balance
- No future borrowing
- Toys must remain outside the clothing wallet

The tracker should make modes configurable per child.

## Purchase tracker

Each purchase should support:

- `id`
- `personId`
- `purchaseDate`
- `description`
- `category`
- `condition`
- `store`
- `necessaryOrDiscretionary`
- `claimedRetailPrice`
- `verifiedRetailPrice`
- `pricePaid`
- `categoryCapUsed`
- `discount`
- `parentPayPercent`
- `calculatedParentContribution`
- `actualParentContribution`
- `childContribution`
- `tax`
- `shipping`
- verification fields
- secondhand status
- `returnDeadline`
- returned status
- `returnedAt`
- archived status
- `parentOverride`
- `parentOverrideReason`
- `notes`
- reflection answers
- `created`
- `updated`

Calculate each receipt item separately. Do not calculate one discount across an entire multi-item receipt.

`PricePaid` and `VerifiedRetail` exclude tax and shipping. Track tax and shipping separately.

Default tax policy:

- Split tax using the final parent/child proportions.

Default shipping policy:

- Standard shipping may be split proportionally.
- Optional expedited shipping is paid by the child.
- Make this configurable.

## Policy snapshot

Every completed purchase must retain a snapshot of the policy used:

- `policyVersion`
- `baselinePercentUsed`
- `ceilingPercentUsed`
- `secondhandBonusUsed`
- `categoryCapUsed`
- `childModeUsed`
- `monthlyDepositSetting`
- `walletMaximumSetting`
- `taxPolicyUsed`
- `shippingPolicyUsed`

Changing current settings must not rewrite historical purchases.

Recalculating a historical purchase requires explicit parent confirmation.

## Returns, edits, deletion, and archiving

### Returns

- Restore the exact `ActualParentContribution` through one refund ledger entry.
- A return cannot be refunded twice.
- Preserve the original purchase record.
- Mark it returned with timestamp and note.

### Editing a completed purchase

- Recalculate against its saved policy snapshot unless the parent explicitly chooses current policy.
- Apply only the difference between old and new `ActualParentContribution` through a correction ledger entry.
- Require parent confirmation before changing wallet history.

### Deleting an erroneous purchase

- Reverse its wallet contribution exactly once.
- Preserve an audit record or tombstone.
- Require confirmation.

### Archiving

- Hides or de-emphasizes the purchase.
- Does not change wallet balance.

Do not silently delete financial history.

## Parent override

A parent may:

- Approve, reject, or correct `VerifiedRetail`
- Change category
- Override category cap
- Mark necessary or discretionary
- Adjust final parent contribution
- Adjust wallet balance through a ledger entry
- Waive or extend cooling-off period
- Record an explanation

The calculator recommends; the parent decides. All overrides should be auditable.

## User interface

Add a Clothing entry point to the current Family Planner.

Provide:

1. Clothing dashboard
2. Per-child wallet cards
3. Deal calculator
4. New-purchase workflow
5. Purchase history
6. Wallet ledger/history
7. Category-cap settings
8. Per-child clothing settings
9. Verification approval queue
10. Return workflow
11. Parent override controls

Dashboard should show:

- Current wallet balance
- Next deposit date
- Maximum balance
- Total verified retail value
- Total actually spent
- Total saved
- Average verified discount
- Parent contribution total
- Child contribution total
- Best percentage deal
- Most dollars saved
- Purchases at full retail
- Return deadlines approaching

For Training Wheels mode, prominently show:

- Balance before purchase
- Parent contribution
- Child contribution
- Projected balance afterward
- Next deposit date
- Cooling-off status

For Intentional Purchase mode, prominently show reflection prompts and later support:

- `timesWorn`
- `costPerWear`
- `wouldBuyAgain`

Times-worn tracking may be deferred if necessary, but the schema should be extensible.

Keep the existing visual language:

- Dark theme
- Compact cards
- Quick-glance information
- Clear labels
- Mobile-first controls
- No horizontal scrolling
- Keyboard accessibility
- Visible focus states
- Do not rely only on color

## Storage and Firebase

Create separate normalized collections equivalent to:

- `clothingPurchases`
- `clothingWalletLedger`
- `clothingSettings`

Use stable person IDs. Use dedicated localStorage keys. Treat missing clothing data as empty/default data.

Include all clothing collections in:

- Initial loading
- Local saving
- Firebase `db.update` payload
- Firebase receive handling
- Deferred rendering while an editor is active
- Export
- Import
- Backup restoration
- Normalization and migration

Older Firebase snapshots or backups that omit clothing collections must not erase current clothing data.

Do not use root `db.set`.

Batch multi-item purchase persistence into one completed local update and one debounced Firebase update.

Apply the existing stale-reference pattern:

- Resolve current records by ID at commit time.
- Do not retain stale captured entity objects.
- Do not write text on every keystroke.
- Defer disruptive remote renders while editing.
- Preserve unrelated newer fields.

## Security and privacy

Do not add authentication or restructure Firebase.

Do not store full receipt images in Realtime Database.

Do not expose sensitive financial notes unnecessarily in public-facing summary cards.

The existing site is publicly hosted, while its family data is loaded through Firebase.

Keep financial controls behind the current parent-control conventions already present in the app.

If the current parent-control model is insufficient for genuinely private financial data, identify that risk in the implementation plan before coding.

Do not pretend client-side hidden controls provide real security.

## Import, export, and migration

Preserve every existing migration path.

New exports must include all clothing collections and policy settings.

Older backups without clothing data must import normally.

Imports that omit clothing data must not erase existing clothing data.

Use collection-presence guards, matching the current Places, Important Dates, and Calendar exclusion protections.

## Printing

Add an optional Clothing section to Print Center.

Default to summary only:

- Wallet balances
- Period totals
- Parent/child contribution totals
- Savings totals

Do not print private notes or verification details unless explicitly selected.

## Version

Do not change the version while writing the design document or implementation plan.

If implementation is later approved and completed, update the application from `1.12-beta` to `1.13-beta`.

Do not change existing localStorage key names.

## Safe testing

Do not test financial mutations against live Firebase data.

Use an isolated temporary copy outside the repository with Firebase disabled.

Test fixtures must include:

- All three child modes
- Monthly deposits
- Duplicate deposit prevention
- Wallet cap behavior
- Verified and unverified retail
- Full-retail purchase
- Discount purchase
- Category-cap overage
- Secondhand with verified retail
- Secondhand without verified retail
- Necessary purchase
- Insufficient wallet balance
- Multi-item receipt
- Parent override
- Purchase edit
- Return
- Duplicate-return prevention
- Erroneous deletion reversal
- Archiving
- Old backup import
- Firebase snapshot missing clothing collections

Verify all financial calculations to the cent.

## Delivery constraints

- Use the current repository and current `index.html` as the only application base.
- Current production release: `1.12-beta` at commit `ae4a196`.
- Preserve every existing feature and tested fix, including Calendar, Important Dates, RCS school-calendar integration, tasks, Places, Shopping, Edit Family synchronization, inline editing, Firebase, import/export, printing, mobile behavior, and the `#calendar` deep link.
- Do not copy from `Home_1.5.html` or `index-v1.4-fixed-backup.html`.
- Leave `.claude/` and `test-artifacts/` untouched and untracked.
- Do not commit or push.
- Before implementation, inspect the current storage, Firebase, normalization, import/export, modal, inline-editing, and person-data architecture.
