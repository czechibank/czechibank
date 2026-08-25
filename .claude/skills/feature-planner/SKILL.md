---
name: feature-planner
description: Plan and document new features by interviewing the user, then generating a structured feature spec (markdown) and Gherkin test scenarios. Use this skill whenever the user wants to plan a new feature, spec out functionality, describes something that sounds like a feature request, says "new feature", "let's plan", "spec out", or uses /start-planning-feature. Also trigger when the user describes desired behavior that doesn't exist yet — even if they don't explicitly say "feature".
---

# Feature Planner

You help turn feature ideas into concrete, test-driven artifacts:

1. **Feature spec** (`docs/features/<feature-name>.md`) — the source of truth for what the feature is, why it exists, how it should behave, and how it's built.
2. **Gherkin feature file** (`docs/features/<feature-name>.feature`) — testable scenarios that can later be moved into `tests/bdd-tests/features/` when implementation begins.

Both files live side-by-side in `docs/features/` so that the feature's documentation and test plan stay together as a unit.

## Core Principle: Test-Driven Development

Every feature planned through this skill is designed to be built with TDD (red-green-refactor). This isn't an afterthought — testability shapes the entire design:

- **API layer** — Every endpoint and service function should have vitest tests written before implementation. The spec should define inputs/outputs clearly enough that tests can be written from the spec alone.
- **UI components** — Components should be designed for Storybook isolation. The spec should identify which components are needed and what states/variants they need (loading, empty, error, populated). Each component gets stories before it gets wired up to real data.
- **E2E flows** — The Gherkin scenarios cover the full user journey and serve as the acceptance test suite.
- **Code structure** — The technical design should favor dependency injection, clear interfaces, and separation of concerns so that units can be tested independently. Avoid tightly coupled code that's hard to test in isolation.

When writing the technical design section, think about testability at every level: "How would someone write a test for this before writing the implementation?"

## Phase 1: Interview

Before generating anything, understand the feature deeply. Ask questions one or two at a time — don't dump a wall of questions. Cover these areas, adapting to what the user has already told you:

- **Who is this for?** Which user role or persona benefits?
- **What problem does it solve?** Why does this feature matter?
- **Core use cases** — Walk through the main happy paths. What does the user do, step by step?
- **Edge cases and error states** — What can go wrong? What happens with empty states, invalid input, permission issues?
- **Acceptance criteria** — How do we know it's done? What are the must-haves vs nice-to-haves?
- **Technical considerations** — Does it need new DB tables, API endpoints, UI components? Any constraints or dependencies on existing features?
- **Testability** — What are the key units to test? Are there complex business logic paths that need thorough unit tests? Which UI components need Storybook stories? Are there integration boundaries (external APIs, DB queries) that need special attention?

If you're unsure about expected behavior or design decisions, use the `/grill-me` approach — dig deeper, challenge assumptions, suggest alternatives. The goal is to resolve ambiguity now, not during implementation.

Explore the codebase as needed to understand what already exists. Check existing DB schema, API routes, and UI patterns so your spec builds on what's there rather than contradicting it.

When you feel you have a solid understanding, summarize what you've learned and confirm with the user before generating files.

## Phase 2: Generate the Feature Spec

Create `docs/features/<feature-name>.md` with this structure:

```markdown
# <Feature Name>

## Overview

Brief description of the feature and the problem it solves.

## User Stories

Who benefits and what they can do. Use the format:

- As a [role], I want to [action] so that [benefit].

## Expected Behavior

Describe how the feature works from the user's perspective. Walk through the main flows. Use sub-sections for distinct workflows if the feature is complex.

## Acceptance Criteria

Checklist of concrete, verifiable conditions that must be true for the feature to be considered complete.

- [ ] Criterion 1
- [ ] Criterion 2

## Technical Design

How it should be built. Reference existing patterns from the codebase. Cover:

- **Database** — New tables or columns needed (reference existing schema conventions)
- **API** — New endpoints, request/response shapes
- **UI** — New pages or components, where they fit in the navigation
- **Dependencies** — What existing features does this interact with?

## Test Strategy

Define what needs to be tested at each level, so implementation can follow TDD (write tests first, then make them pass):

- **Unit tests (vitest)** — Service functions, validators, business logic. List the key test cases.
- **Storybook stories** — UI components with their states (default, loading, empty, error, edge cases). List each component and its variants.
- **E2E tests** — Reference the companion `.feature` file. These cover the full user flows.

The goal: someone should be able to write all the tests from this section before writing any implementation code.

## Edge Cases & Error Handling

Document known edge cases and how they should be handled.

## Open Questions

Anything unresolved that needs further discussion before or during implementation.
```

Adapt the sections to fit the feature — skip sections that don't apply, add new ones if the feature calls for it. The structure is a guide, not a rigid template.

## Phase 3: Generate the Gherkin Feature File

Create `docs/features/<feature-name>.feature` alongside the spec.

Before writing scenarios, read `CLAUDE.md` to check the **Existing shared steps** table. Reuse existing steps wherever they fit — don't reinvent steps that already exist. This keeps the test suite consistent and reduces implementation work later.

Write scenarios that cover:

- Each happy path from the expected behavior section
- Key error states and edge cases
- Permission/auth scenarios if relevant

Follow the conventions from the existing `.feature` files in the project:

- Each scenario should be self-contained (start with auth/setup steps)
- Use `Given` for setup, `When` for actions, `Then` for assertions
- Use `{string}` placeholders for parameterized values
- Keep scenarios focused — one behavior per scenario
- Use descriptive scenario names that explain what's being tested

When a scenario needs a step that doesn't exist yet, write it in the natural Gherkin style that fits the existing patterns. Add a comment at the top of the feature file listing the new steps that will need implementation:

```gherkin
# New steps needed:
#   Given I have a <thing> — <brief description of setup>
#   When I do <action> — <what it does>
#   Then I see <result> — <what to assert>

Feature: <Feature Name>
  ...
```

## After Generating

Once both files are created:

1. Present a summary of what was generated
2. Ask if the user wants to adjust anything — scenarios, acceptance criteria, technical approach
3. Mention that the `.feature` file can be moved to `tests/bdd-tests/features/` and steps implemented when the feature is ready for development
4. **Suggest the next step:** Tell the user they can now run `/write-a-prd` to turn this feature spec into a formal PRD (GitHub issue) with detailed module design, implementation decisions, and testing plan. The feature spec and Gherkin file created here serve as the foundation for that PRD.

## Relationship with /write-a-prd

This skill and `/write-a-prd` are designed as a two-step workflow:

- **Feature Planner (this skill)** is step 1 — exploratory. It captures the "what" and "why" through an interview, produces a feature spec with acceptance criteria, a test strategy, and Gherkin scenarios. The output lives in the repo as `docs/features/`.
- **Write a PRD** is step 2 — formal. It takes the understanding built here and produces a GitHub issue with detailed module design, implementation decisions, API contracts, and testing plan. It's the bridge from spec to implementation.

If the user already has a feature spec in `docs/features/`, point them to `/write-a-prd` to continue. If they jump straight to `/write-a-prd` without a feature spec, that's fine too — the PRD skill does its own interview.
