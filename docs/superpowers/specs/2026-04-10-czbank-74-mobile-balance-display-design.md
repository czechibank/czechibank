# CZBANK-74: Mobile Balance Display Fix

## Context

On mobile portrait view, bank account balance cards have layout issues:

- Multiple accounts overlap because the grid is hardcoded to 2 columns with no responsive breakpoints
- Large balance values (e.g., 10000 czechitokens) overflow their card container
- An invalid Tailwind class (`w-max-[400px]`) means the card has no effective max-width

Tested on: https://develop.czechibank.ostrava.digital with user Marta Stewart (multiple accounts).

## Root Causes

| #   | File                                      | Line | Issue                                                |
| --- | ----------------------------------------- | ---- | ---------------------------------------------------- |
| 1   | `src/components/bank-account/ba-list.tsx` | 56   | `grid-cols-2` hardcoded, no responsive breakpoint    |
| 2   | `src/components/bank-account/ba-card.tsx` | 48   | `text-5xl` on all screen sizes, no responsive sizing |
| 3   | `src/components/bank-account/ba-card.tsx` | 19   | `w-max-[400px]` is invalid Tailwind (does nothing)   |

## Chosen Approach: Responsive Fix + Overflow Safety

### Change 1: Responsive grid (`ba-list.tsx:56`)

```diff
- <div className="grid grid-cols-2 gap-4">
+ <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
```

Stack cards on mobile (<640px), 2 columns on `sm`+.

### Change 2: Fix invalid class (`ba-card.tsx:19`)

```diff
- <Card className="w-max-[400px] group relative duration-300 hover:shadow-md">
+ <Card className="max-w-[400px] group relative duration-300 hover:shadow-md">
```

### Change 3: Responsive balance text + overflow (`ba-card.tsx:48-50`)

```diff
- <h1 className="flex scroll-m-20 flex-row items-center space-x-2 text-5xl font-extrabold tracking-tight lg:text-5xl">
-   <Image src="/czechitoken-black.svg" alt="Czechitoken" width={40} height={40} />
-   <span>{bankAccount.balance.toFixed(1)}</span>
+ <h1 className="flex scroll-m-20 flex-row items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-5xl">
+   <Image src="/czechitoken-black.svg" alt="Czechitoken" width={40} height={40} className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
+   <span className="truncate">{bankAccount.balance.toFixed(1)}</span>
```

- Progressive text sizing: `text-2xl` -> `sm:text-3xl` -> `md:text-5xl`
- `space-x-2` -> `gap-2` for better flex behavior
- Icon scales responsively with Tailwind classes
- `truncate` prevents overflow on extreme balance values

## Verification

1. `pnpm run dev` — start dev server
2. Open Chrome DevTools, toggle mobile viewport (375px portrait)
3. Test scenarios:
   - 1 account, balance = 0
   - 1 account, balance = 10000
   - Multiple accounts (2+)
   - Landscape orientation
4. `pnpm run lint` — confirm no lint issues
5. `pnpm run build` — confirm build passes
