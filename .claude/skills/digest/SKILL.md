---
name: digest
description: Weekly digest to Discord. Proposes the five bugs to fix next with reasons, reports the three process metrics, and lists what the bot did this week. Use when the user says "digest", "weekly summary", or runs /digest. Default is dry-run to a file; --post sends to Discord.
---

# Digest

Runs weekly, usually Monday. Output is one Discord message via `DISCORD_WEBHOOK_URL` from
`.env`. Never sends unless the user passed `--post`; otherwise write to `./digest-out/<date>.md`
and show it.

## Gather (all via `gh`, JSON output)

1. Open bugs: `gh issue list --label bug --state open --limit 200 --json number,title,labels,createdAt,comments,updatedAt`.
2. Closed this week: `gh issue list --state closed --search "closed:>=<7 days ago>"`.
3. PRs merged this week and PRs open with `ai-generated`.
4. Feature files and tests: `ls tests/bdd-tests/features/*.feature | wc -l`, `grep -c "it(" tests/api/*.ts tests/unit/*.ts`.
5. Bot activity: comments this week whose body starts with the 🤖 marker.

## Rank the bugs

Pick five open bugs to propose. Score, highest first:

- money or auth involved (transactions, balances, API keys, sessions): +3
- label `ready` (triaged, reproducible): +2
- reported by more than one person, or a duplicate was closed against it: +2
- `priority: high`: +1
- older than 60 days with no activity: +1
- `needs-info` with no reply: excluded

Write one line per bug: number, title, and the reason in plain words ("touches balances,
reproduced, 3 months old"). The user approves by adding label `ai-fix`; say so at the end.

## Metrics (three, always the same)

- **Complete reports first try**: share of bug issues opened this week whose first triage comment said "nothing" under "What would help". Show as `n of m`.
- **Issue to merge**: median days from issue creation to merge of the PR that closed it, for issues closed this week. Show as a number of days, or "no merges this week".
- **Test count**: number of `.feature` files and number of `it(` blocks, with the delta since last digest (read `./digest-out/last.json`, then overwrite it).

## Message format

Under 40 lines. Plain text with Discord markdown, no headings deeper than bold.

```
🤖 Weekly digest (AI-generated, run by @<login>) · <date>

**Fix next** (add label ai-fix to approve)
1. #n title · reason
...

**Numbers**
Complete reports first try: n of m
Issue to merge: x days (n merged)
Tests: f feature files (+d), t tests (+d)

**Bot this week**
triaged n · fixes opened n · merged n · waiting on reporter n

**Needs a human**
- <anything the bot could not decide, e.g. product questions from needs-info issues>
```

Send with `curl -H "Content-Type: application/json" -d '{"content": ...}' "$DISCORD_WEBHOOK_URL"`.
Escape the JSON with `jq -Rs '{content: .}'`.

## Voice

Run the `unslop` skill over the message before sending. Reasons are one clause each; no
"great progress this week".
