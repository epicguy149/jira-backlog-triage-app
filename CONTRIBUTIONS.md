# Contributions

Log Juggler was built as a five-person university capstone (UNSW COMP3900) with
Atlassian as the industry client, delivered across three sprints in late 2025.
This repository preserves the full commit history of the shipped branch.

## Ownership

I designed and implemented the final application architecture and the majority
of the codebase:

- **Backend, in full** — the layered Forge runtime: resolver/presentation layer,
  application services, persistence layer over Forge KVS, and the backend test
  suite.
- **Shared API contracts** — the Zod schemas in `contracts/api` used as the
  single source of truth across the frontend/backend boundary.
- **Frontend foundation** — application shell, navigation, context/state
  management, and the Jira client adapter.
- **Swipe Mode, in full** — the primary triage workflow: grid and card UI, swipe
  gestures and keyboard equivalents, inline editing, persistent per-user
  per-board review state, action history with undo, and optimistic updates with
  rollback.

Sprints 1–2 used a monolithic JavaScript implementation. I assessed that it
would not meet the project's software-quality requirements, judged a full
rebuild feasible within the remaining schedule, proposed it to the team, and
then designed and implemented the replacement architecture. The refactor branch
was stabilised on 11 November 2025, after which the remaining feature work was
built inside it.

## Work by other team members

- **Matrix Mode UI** — Charles McElvogue
- **Matrix Mode tests** — Qiyuan Ning
- **Dockerisation / dev container** — Ariraam Ramanan

## Verifying this

Commit counts on this branch, excluding merge commits:

```
git shortlog -sne --no-merges main
git rev-list main --count --no-merges
```

This reports **245 of 305 commits (80%)** authored by me, matching the original
project repository.

GitHub's contributor graph for this repository shows a lower absolute count,
because it omits commits whose changes fell entirely within course-specific
build files that were removed when this history was sanitized. The proportion
is comparable either way, and I remain the top contributor by roughly 15x.

Commit counts measure activity rather than value, and the figure above spans
the whole project including the pre-refactor codebase that was ultimately
replaced. The more meaningful statement is the scope breakdown above, which can
be checked directly against the source tree.

## Note on history

Author email addresses have been replaced with non-routable placeholders to
avoid publishing contributors' personal contact details. Names, commit
messages, timestamps and authorship are unmodified. Course-specific build and
assessment files have been removed from the history; application source is
complete.
