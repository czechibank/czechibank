#!/usr/bin/env python3
"""Import a Jira CSV export into GitHub issues.

Usage:
  python3 scripts/jira-import/jira-to-github.py export.csv --dry-run [--out DIR]
  python3 scripts/jira-import/jira-to-github.py export.csv --apply [--only-open]
  python3 scripts/jira-import/jira-to-github.py export.csv --apply --relink   # rewrite bodies from an existing map

Dry-run writes one markdown file per issue into DIR (default ./jira-import-preview)
and prints a summary. --apply creates issues via `gh` in Jira creation order,
closes the ones that were Done / Won't do, and writes a key->number map to
jira-import-map.json so parent/link references can be rewritten in a second pass.
"""
import csv, json, os, re, subprocess, sys
from collections import defaultdict
from datetime import datetime

CLOSED_STATUSES = {"Done", "Won't do", "RELEASED"}
TYPE_LABEL = {"Bug": "bug", "Story": "feature", "Task": "task", "Subtask": "task", "Epic": "epic"}
STATUS_LABEL = {
    "Ready to DEV": "ready", "In Progress": "in progress", "Code review": "waiting for review",
    "IN TESTING": "in testing", "Waiting for test": "in testing",
}
PRIORITY_LABEL = {"Highest": "priority: high", "High": "priority: high", "Low": "priority: low", "Lowest": "priority: low"}
JIRA_LABEL_MAP = {"UI-first-pick": "ui", "ux": "ux", "design": "design", "API": "api", "bug-hunt": "bug-hunt",
                  "Documentation": "documentation", "Refactoring": "refactoring"}  # TEMPLATE, Bug dropped

def jira_to_md(text):
    if not text:
        return ""
    t = text.replace("\r\n", "\n")
    t = re.sub(r"\{code(?::[^}]*)?\}(.*?)\{code\}", lambda m: "\n```\n" + m.group(1).strip("\n") + "\n```\n", t, flags=re.S)
    t = re.sub(r"\{noformat\}(.*?)\{noformat\}", lambda m: "\n```\n" + m.group(1).strip("\n") + "\n```\n", t, flags=re.S)
    t = re.sub(r"\{\{(.+?)\}\}", r"`\1`", t)
    t = re.sub(r"!([^!|\n]+?)(?:\|[^!]*)?!", r"[attachment: \1]", t)          # !img.png|width=1! -> placeholder
    t = re.sub(r"\[(https?://[^\]|]+)\|\1\]", r"\1", t)                       # [url|url] -> url
    t = re.sub(r"\[(https?://[^\]|]+)\]", r"\1", t)                              # [url] -> url
    t = re.sub(r"\[([^\]|]+)\|([^\]]+)\]", r"[\1](\2)", t)                     # [text|url]
    t = re.sub(r"^h([1-6])\.\s*", lambda m: "#" * int(m.group(1)) + " ", t, flags=re.M)
    t = re.sub(r"^(\s*)#+\s", r"\g<1>1. ", t, flags=re.M)                     # numbered lists
    t = re.sub(r"^(\s*)\*+\s", r"\g<1>- ", t, flags=re.M)                     # bullets
    t = re.sub(r"(?<![\w*])\*([^*\n]+?)\*(?![\w*])", r"**\1**", t)             # *bold*
    t = re.sub(r"(?<!\w)_([^_\n]+?)_(?!\w)", r"*\1*", t)                       # _italic_
    t = t.replace(" ", " ")
    return t.strip()

def parse_date(s):
    for fmt in ("%d/%b/%y %I:%M %p", "%d/%b/%Y %I:%M %p"):
        try:
            return datetime.strptime(s.strip(), fmt)
        except ValueError:
            pass
    return None

def load(path):
    rows = list(csv.reader(open(path, encoding="utf-8-sig")))
    h = rows[0]
    single = {c: i for i, c in enumerate(h) if h.count(c) == 1}
    multi = defaultdict(list)
    for i, c in enumerate(h):
        if h.count(c) > 1:
            multi[c].append(i)
    names = {}
    pairs = [("Reporter", "Reporter Id"), ("Assignee", "Assignee Id"), ("Creator", "Creator Id"),
             ("Watchers", "Watchers Id"), ("Custom field (Tested by)", "Custom field (Tested by)Id"),
             ("Custom field (Want to test)", "Custom field (Want to test)Id"), ("Project lead", "Project lead id")]
    for n, i in pairs:
        ncols = [k for k, c in enumerate(h) if c == n]
        icols = [k for k, c in enumerate(h) if c == i]
        for r in rows[1:]:
            r += [""] * (len(h) - len(r))
            for a, b in zip(ncols, icols):
                if r[a].strip() and r[b].strip():
                    names[r[b].strip()] = r[a].strip()
    issues = []
    for r in rows[1:]:
        g = lambda k: r[single[k]].strip() if k in single else ""
        m = lambda k: [r[i].strip() for i in multi.get(k, []) if r[i].strip()]
        issues.append({
            "names": names, "creator": g("Creator"), "watchers": m("Watchers"),
            "key": g("Issue key"), "summary": g("Summary"), "type": g("Issue Type"), "status": g("Status"),
            "priority": g("Priority"), "reporter": g("Reporter"), "assignee": g("Assignee"),
            "created": parse_date(g("Created")), "resolved": g("Resolved"), "description": g("Description"),
            "environment": g("Environment"), "parent_key": g("Parent key"), "parent_summary": g("Parent summary"),
            "labels": m("Labels"), "comments": m("Comment"), "attachments": m("Attachment"),
            "links": {k: m(k) for k in multi if "issue link" in k} | {k: [g(k)] for k in single if "issue link" in k and g(k)},
        })
    issues.sort(key=lambda x: int(x["key"].split("-")[1]))
    return issues

def render(it):
    parts = []
    meta = [f"Imported from Jira **{it['key']}** ({it['type']}, status *{it['status']}*, priority {it['priority']})",
            f"Reported by {it['reporter']} on {it['created']:%Y-%m-%d}" if it["created"] else f"Reported by {it['reporter']}"]
    if it["creator"] and it["creator"] != it["reporter"]:
        meta.append(f"Created by {it['creator']}")
    if it["assignee"]:
        meta.append(f"Assignee in Jira: {it['assignee']}")
    if it["resolved"]:
        meta.append(f"Resolved in Jira: {it['resolved']}")
    if it["watchers"]:
        meta.append(f"Watchers: {', '.join(it['watchers'])}")
    if it["parent_key"]:
        meta.append(f"Parent: {it['parent_key']} ({it['parent_summary']})")
    for k, v in it["links"].items():
        if v:
            meta.append(f"{k}: {', '.join(v)}")
    parts.append("\n".join(f"> {m}" for m in meta))
    parts.append(jira_to_md(it["description"]) or "*(no description in Jira)*")
    if it["environment"]:
        parts.append("### Environment\n" + jira_to_md(it["environment"]))
    if it["attachments"]:
        lines = []
        for a in it["attachments"]:
            f = a.split(";")
            if len(f) >= 4:
                who = it["names"].get(f[1])
                lines.append(f"- [{f[2]}]({f[3]}) ({who + ', ' if who else ''}{f[0]})")
        parts.append("### Attachments (Jira login required)\n" + "\n".join(lines))
    if it["comments"]:
        lines = []
        for c in it["comments"]:
            f = c.split(";", 2)
            if len(f) == 3:
                author = it["names"].get(f[1], f[1])
                lines.append(f"**{author}**, {f[0]}\n\n{jira_to_md(f[2])}")
        parts.append("### Comments from Jira\n\n" + "\n\n---\n\n".join(lines))
    return "\n\n".join(parts)

def labels_for(it):
    labels = {TYPE_LABEL.get(it["type"], "task")}
    if it["status"] in STATUS_LABEL:
        labels.add(STATUS_LABEL[it["status"]])
    if it["status"] == "Won't do":
        labels.add("wontfix")
    if it["priority"] in PRIORITY_LABEL:
        labels.add(PRIORITY_LABEL[it["priority"]])
    for l in it["labels"]:
        if l in JIRA_LABEL_MAP:
            labels.add(JIRA_LABEL_MAP[l])
    labels.add("jira-import")
    return sorted(labels)

def ensure_labels(needed):
    have = {l["name"] for l in json.loads(subprocess.check_output(["gh", "label", "list", "--limit", "200", "--json", "name"]))}
    colors = {"feature": "a2eeef", "task": "bfdadc", "epic": "3e4b9e", "ready": "0e8a16", "in progress": "fbca04",
              "in testing": "c5def5", "priority: high": "b60205", "priority: low": "e6e6e6", "jira-import": "ededed",
              "ui": "f9d0c4", "ux": "f9d0c4", "design": "f9d0c4", "api": "1d76db", "bug-hunt": "d93f0b",
              "refactoring": "c2e0c6"}
    for l in needed - have:
        subprocess.run(["gh", "label", "create", l, "--color", colors.get(l, "ededed")], check=True)

def main():
    args = sys.argv[1:]
    if not args or not os.path.exists(args[0]):
        sys.exit(__doc__)
    issues = load(args[0])
    if "--only-open" in args:
        issues = [i for i in issues if i["status"] not in CLOSED_STATUSES]
    out = args[args.index("--out") + 1] if "--out" in args else "jira-import-preview"
    if "--apply" not in args:
        os.makedirs(out, exist_ok=True)
        for it in issues:
            with open(os.path.join(out, f"{it['key']}.md"), "w") as f:
                f.write(f"# [{it['key']}] {it['summary']}\n\nlabels: {', '.join(labels_for(it))}\nstate: {'closed' if it['status'] in CLOSED_STATUSES else 'open'}\n\n{render(it)}\n")
        print(f"{len(issues)} issues rendered to {out}/")
        print("open:", sum(1 for i in issues if i["status"] not in CLOSED_STATUSES), "closed:", sum(1 for i in issues if i["status"] in CLOSED_STATUSES))
        return
    mapping = {}
    if "--relink" in args:
        mapping = json.load(open(os.path.join(os.path.dirname(__file__), "jira-import-map.json")))
        issues = [i for i in issues if i["key"] in mapping]
    else:
        ensure_labels({l for it in issues for l in labels_for(it)})
    for it in issues if not mapping else []:
        body = render(it)
        cmd = ["gh", "issue", "create", "--title", f"[{it['key']}] {it['summary']}", "--body", body]
        for l in labels_for(it):
            cmd += ["--label", l]
        url = subprocess.check_output(cmd, text=True).strip()
        num = int(url.rstrip("/").split("/")[-1])
        mapping[it["key"]] = num
        if it["status"] in CLOSED_STATUSES:
            reason = "not planned" if it["status"] == "Won't do" else "completed"
            subprocess.run(["gh", "issue", "close", str(num), "--reason", reason], check=True)
        print(it["key"], "->", url)
    if "--relink" not in args:
        json.dump(mapping, open(os.path.join(os.path.dirname(__file__), "jira-import-map.json"), "w"), indent=2)
    # second pass: rewrite CZBANK-n references into #m so parents and links become real GitHub links
    for it in issues:
        body = render(it)
        new = re.sub(r"\b(CZBANK-\d+)\b",
                     lambda m: f"#{mapping[m.group(1)]} ({m.group(1)})" if m.group(1) in mapping and m.group(1) != it["key"] else m.group(1),
                     body)
        if new != body or "--relink" in args:
            subprocess.run(["gh", "issue", "edit", str(mapping[it["key"]]), "--body", new], check=True)
    print("done, map written to jira-import-map.json")

if __name__ == "__main__":
    main()
