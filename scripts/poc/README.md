# #89 proof of concept — session spoofing on the web transfer

`spoof-userid.poc.ts` shows that, before the fix, a signed-in user could move
money out of another account by rewriting the `userId` the browser sends to the
`sendMoneyToBankNumberAction` server action.

Run it against a running app (never commit it into the test suite; it is a live
exploit):

```
PW_BASE_URL=http://localhost:3000 pnpm tsx scripts/poc/spoof-userid.poc.ts
```

After the fix in this PR it prints "blocked" (the action derives the sender from
the session and ignores the browser's `userId`). An automated e2e regression is
tracked as a follow-up; it needs a stable login+intercept harness that does not
belong in the per-PR CI run.
