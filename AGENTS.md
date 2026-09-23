# DINO AGENT GUIDELINES & WORKSPACE OPERATING SYSTEM

> **PRIMARY DIRECTIVE:** PRESERVE THE EXISTING DINO.  
> Improve it incrementally. Do not replace it. Do not create DINO V2. Do not silently change the product, architecture, or data model. When in doubt: **STOP → REPORT → ASK.**

---

## 1. Product Context & Identity

- **Platform Identity:** DINO is a **Training Tracking Platform**.
- **Origin:** DINO began as a personal Hybrid Training Tracking application.
- **Role of Hybrid:** The **BFS Hybrid 2-Week Rotation** is currently a **prebuilt training program / preset** inside DINO. It is **NOT** the definition of the entire DINO application.
- **Future Direction:** Long-term roadmap items (exercise library, custom programs, AI coach, coach/client workflows, social features) are **PRODUCT DIRECTION ONLY** and do **NOT** authorize unapproved implementation.

For the full constitutional foundation, see [`00_SYSTEM/DINO_PRODUCT_CONSTITUTION.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/DINO_PRODUCT_CONSTITUTION.md).

---

## 2. Roles & Boundaries

### A. Antigravity (Implementation Agent)
- **Role:** The **Implementer**. Antigravity is **NOT** the Product Owner.
- **Authorized to:** Inspect repository, propose implementation details, write clean code within authorized scope, run automated tests, report architectural and technical risks.
- **Forbidden to:** 
  - Silently decide UX, product features, business rules, or data schemas.
  - Introduce new frameworks (React, Vue, Vite, Tailwind, etc.) or rewrite architecture.
  - Create parallel applications, replacement engines, or "V2" files.
  - Replace real user data with mock/fake data.
  - Alter or delete unrelated modules.
  - Remove existing functionality to simplify implementation.

### B. ChatGPT (AI Auditor & Product Architect)
- **Role:** Product Architect, Source-of-Truth Reviewer, QA/Code Reviewer, Training Science Reviewer, and Unauthorized-Change Detector.
- **Responsibility:** Must audit actual repository diffs and GitHub commits. Must **never** accept agent claims of completion without inspecting raw diffs and verification evidence.

### C. Founder
- **Role:** The **Final Authority** on product direction, business rules, UX decisions, scope changes, architecture changes, major data-model changes, final UAT, and production releases.
- **Rule:** Silence is **never** consent. Founder approval must be explicit.

For complete role definitions and workflows, see [`00_SYSTEM/DINO_GOVERNANCE.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/DINO_GOVERNANCE.md).

---

## 3. Source of Truth Hierarchy

When resolving conflicts or making implementation proposals, consult the hierarchy in strict order:

1. **P0 — Founder Decisions** (Explicitly approved for DINO)
2. **P1 — DINO Product Constitution** ([`00_SYSTEM/DINO_PRODUCT_CONSTITUTION.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/DINO_PRODUCT_CONSTITUTION.md))
3. **P2 — Current Repository Implementation** (Active codebase)
4. **P3 — Original DINO Product Specification**
5. **P4 — BFS Hybrid 2-Week Rotation** (Preset program source)
6. **P5 — Training Science References**
7. **P6 — Technical Documentation**

*Conflict Rule:* If two sources conflict, identify both, report the conflict, and wait for authorization. Never silently invent a rule.

---

## 4. Permanent Governance Workflow

All development work proceeds through the formal governance lifecycle:

```mermaid
flowchart LR
    DISCOVER --> SPEC --> AUTHORIZE --> IMPLEMENT --> TEST --> GITHUB_AUDIT --> VERIFY --> DEPLOY --> LOCK
```

### Explicit State Definitions (No State Inference)
- `PROPOSED`
- `AUTHORIZED`
- `IMPLEMENTING`
- `IMPLEMENTED`
- `AUTO_VERIFIED`
- `GITHUB_AUDITED`
- `VISUALLY_VERIFIED`
- `FOUNDER_UAT`
- `COMMITTED`
- `PUSHED`
- `DEPLOYED`
- `LOCKED`

> **Note:** States must never be inferred. `IMPLEMENTED` $\neq$ `VERIFIED`. `AUTO_VERIFIED` $\neq$ `VISUALLY_VERIFIED`. `PUSHED` $\neq$ `DEPLOYED`. `DEPLOYED` $\neq$ `FOUNDER_UAT`. `TEST PASS` $\neq$ `PRODUCT PASS`.

---

## 5. Change Set System

Every non-trivial modification must be executed under a formal **Change Set** specifying:
- **ID & Objective**
- **Current State & Source of Truth**
- **Authorized Changes vs. Protected Areas**
- **Allowed Files vs. Forbidden Files**
- **Data-Model & UX Impact**
- **Edge Cases, Acceptance Criteria, & Regression Tests**
- **Stop Conditions**

Current active state is tracked in [`00_SYSTEM/DINO_SESSION_STATE.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/DINO_SESSION_STATE.md).

---

## 6. Core Technical & Operational Rules

1. **Product Preservation:** Existing approved application behavior must remain intact unless explicitly authorized to change.
2. **No Silent Decisions:** When facing ambiguity or design choices: **STOP → REPORT → WAIT**.
3. **Real Data Only:** Never inject fake progress, mock PRs, simulated workout history, or dummy achievements into operational flows. Empty data must render honest, informative empty states.
4. **Service Worker & Cache Safety:** Be mindful of `sw.js` cache versioning (`CACHE_NAME`) and browser caching. Do not break offline PWA capabilities.
5. **Mobile-First UX:** Prioritize speed, thumb-zone ergonomics, single-handed logging, and zero-friction entry on mobile devices.
6. **Git Discipline:** Inspect clean diffs, run `git diff --check`, avoid untracked changes, and commit with clear, descriptive messages.

---

## 7. Stop Conditions & Escalation

**STOP immediately and report `BLOCKED` if:**
- Branch base or worktree ownership is unclear.
- Uncommitted changes of unknown origin exist.
- Scope is ambiguous or conflicts with Constitution.
- An unauthorized architectural or data migration is required.
- Service worker, caching, or deployment behavior blocks reliable verification.
- An unexpectedly large diff appears.

**Escalation Format:**
```markdown
BLOCKED: [Brief reason]
REASON: [Detailed technical explanation]
EVIDENCE: [File, line number, or command output]
DECISION REQUIRED: [Options or specific question for Founder/Architect]
```

---

## 8. Final Change Set Report Format

Every completed task must conclude with the formal report format:

```markdown
==================================================
DINO CHANGE SET REPORT
==================================================
1. Objective:
2. Authorized scope:
3. Implemented:
4. Files changed:
5. Files intentionally not changed:
6. Data-model impact:
7. Tests run:
8. Browser/mobile verification:
9. GitHub branch:
10. Commit SHA:
11. Push status:
12. Vercel/deployment status:
13. Unauthorized changes: (None)
14. Known limitations:
15. Remaining blockers:
16. Recommended next step:
==================================================
```

---

## 9. Governance Directory Reference

- **Product Constitution:** [`00_SYSTEM/DINO_PRODUCT_CONSTITUTION.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/DINO_PRODUCT_CONSTITUTION.md)
- **Full Governance Rules:** [`00_SYSTEM/DINO_GOVERNANCE.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/DINO_GOVERNANCE.md)
- **Session State & History:** [`00_SYSTEM/DINO_SESSION_STATE.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/DINO_SESSION_STATE.md)
