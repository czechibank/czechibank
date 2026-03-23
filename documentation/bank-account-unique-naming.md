# Bank account unique names

This document describes how Czechibank keeps bank account names unique.

- The rule is **per user**: one user cannot have two active accounts with the exact same name.
- Different users may still use the same name, for example both can have an account called `AKA`.
- Logic: `src/domain/bankAccount-domain/ba-helpers.ts`
- Tests: `tests/unit/bankAccount-domain/ba-helpers.test.ts`

## Main rules

1. If the requested name is **not used yet** by that user, we keep it unchanged.
2. If the same user already has that **exact** name, we add or change a suffix such as ` (01)`, ` (02)`.
3. In the UI, only that system-added suffix is shown in grey.

## What counts as a system suffix

Our suffix is a name ending with:

- a space
- `(`
- two or more digits
- `)`

Examples:

- `AKA (04)` -> system suffix
- `AKA(4)` -> not a system suffix
- `AKA (4)` -> not a system suffix

## How numbering works

First we determine the **base name**:

- `AKA (04)` -> base is `AKA`
- `AKA(4)` -> base is `AKA(4)`
- `AKA (4)` -> base is `AKA (4)`

Then we look at names already used for that base:

- plain base, for example `AKA`, counts as `0`
- `AKA (01)` counts as `1`
- `AKA (04)` counts as `4`

## Examples

### Duplicate of a plain name

If `AKA` already exists and you create another `AKA`, the plain name counts as “no number”, and we pick the first free numbered suffix starting from `1`.

Example:

- existing: `AKA`, `AKA (01)`, `AKA (03)`
- result: `AKA (02)`

### Duplicate of a numbered name

If `AKA (04)` already exists and you create `AKA (04)` again, we read the number `04` as `4`, then start checking from `5`.

Example:

- existing: `AKA (01)`, `AKA (04)`, `AKA (10)`
- requested again: `AKA (04)`
- result: `AKA (05)`

Even though `AKA (02)` does not exist, we do **not** go back to `02` here. We only look at numbers higher than the one in the name you tried to create: `5`, `6`, `7`, and so on.

## Rename

When renaming an account, we ignore that same account during the duplicate check, so you do not conflict with your own current name.
