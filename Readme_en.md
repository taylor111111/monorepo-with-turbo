# Monorepo Architecture & Tooling Research

---

## Project Intent

This repository is a **tooling-oriented research project** focused on understanding how modern monorepo architectures are composed, how different tools collaborate, and where their responsibilities and boundaries lie.

It is intentionally **not** a production recommendation or a best-practice template. Instead, it serves as a comparative reference for discussing monorepo-related technologies in a precise, architecture-level way.

---

## What This Repository Is (and Is Not)

**This repository is:**
- A comparative study of monorepo architectures
- A tooling-level exploration (not business-level)
- A discussion space for concepts such as workspace, dependency management, and task orchestration
- A concrete, runnable reference for technical discussions and interviews

**This repository is NOT:**
- A production-ready starter
- A recommendation to migrate to Turborepo
- An opinionated best-practice guide
- A replacement for real-world engineering decision making

---

## Baseline Architecture

The baseline of this research is a **CRA + Yarn Workspace monorepo** that already works without Turborepo:

- CRA provides build/start tooling (Webpack-based)
- Yarn Workspaces provide package sharing
- Shared code is organized as `domain` and `widgets`

This baseline is intentionally preserved to make it clear **what Turborepo changes and what it does not**.

---

## Introducing Turborepo

Turborepo is introduced as a **task orchestration layer**, not as a replacement for:

- Workspaces (package sharing)
- Package managers (dependency resolution)
- CRA tooling (build/start)

In this repository, Turborepo is used to:
- Schedule tasks across packages
- Execute tasks in parallel where possible
- Build a deterministic task DAG
- Enable caching semantics at the task level

---

## Repository Structure

```
monorepo-with-turbo/
├── apps/                 # Application entry points (app-d, app-e)
├── packages/             # Reusable packages
│   ├── domain-user/      # Domain-level shared business logic
│   └── widgets/          # Business widgets (UI + behavior)
├── tooling/              # CRA-based tooling (webpack / build / start)
│   └── cra-config/
├── docs/                 # Architecture & tooling research documents
│   └── dependency-management/
├── turbo.json            # Turborepo task configuration
└── Readme.md
```

---

## Tooling Responsibilities & Boundaries

This repository intentionally separates concerns:

- **Workspace (Yarn / pnpm):** package sharing
- **Package Manager:** dependency storage and resolution model
- **CRA Tooling:** build and dev server behavior
- **Turborepo:** task scheduling and execution order

A central theme of this research is that **monorepo is a structural concept**, while tools only address parts of that structure.

---

## Task Orchestration (DAG Perspective)

With Turborepo enabled, build and start tasks form an explicit **Directed Acyclic Graph (DAG)**.

This DAG represents:
- Dependency relationships between packages
- Execution order (topological / post-order traversal)
- Cache boundaries

The DAG is observable via Turborepo task metadata and logs, making task relationships explicit rather than implicit.

---

## Domain vs Widget Reuse Model

This repository distinguishes between two types of reusable code:

- **Domain packages:** shared business logic that evolves with business rules
- **Widgets:** reusable business-facing UI modules that travel with release cycles

This model reflects real-world financial frontend constraints, where not all shared code is suitable for npm publishing.

---

## Documentation Index

The following documents capture individual research threads:

### Dependency & Tooling Research (`docs/dependency-management/`)

- `monorepo-tooling-boundaries.md`
- `npm-vs-yarn-vs-pnpm-what-problem-does-each-solve.md`
- `pnpm.md`
- `yarn_vs_pnpm.md`
- `workspace.md`
- `turbo.md`
- `Turbo_vs_turborepo_example.md`

### Architecture & Design Notes

- `CRA_Monorepo_Workspace.md`
- `domain.md`
- `widgets.md`
- `not_only_components.md`
- `not_npm.md`
- `not_npm_why.md`
- `todo.md`

---

## How to Use This Repository

This repository is best used as:

- A discussion artifact during technical interviews
- A reference when comparing monorepo tooling choices
- A concrete example to anchor abstract tooling conversations

It is **not** intended to be forked and used directly in production.

---

## Final Note

The goal of this repository is not to promote tools, but to **clarify thinking**.

Monorepo decisions are architectural decisions. Tools are secondary.

