# DINO PRODUCT CONSTITUTION

> **Status:** PERMANENT & LOCKED  
> **Authority:** P1 Source of Truth (Directly subordinate only to P0 DINO Project Owner explicit decisions)
> **Scope:** Defines the fundamental identity, principles, boundaries, and long-term vision of DINO.

---

## 1. Product Identity

**DINO is a Training Tracking Platform.**

DINO provides athletes, coaches, and lifters with an intelligent, friction-free, high-precision training management and execution environment. It bridges structured workout programming, real-time logging, progressive overload tracking, physiological recovery metrics, and actionable analytics.

---

## 2. Product Origin

DINO originally originated as a personal **Hybrid Training Tracking** application designed to balance concurrent strength training, hypertrophy, running endurance, and metabolic conditioning.

---

## 3. Current Role of Hybrid Training & BFS Rotation

The **BFS Hybrid Athlete 2-Week Rotation** is an approved **prebuilt training program / preset** inside DINO.

- It serves as a flagship preloaded program demonstrating concurrent hybrid training methodology.
- **Critical Rule:** The BFS Hybrid 2-Week Rotation **must not** be hard-coded as the immutable definition of the entire DINO application.
- The underlying architecture of DINO must remain modular, allowing future programs, custom splits, and alternative training methodologies to coexist without being constrained by the BFS preset structure.

---

## 4. Long-Term Direction & Scope Boundaries

DINO's long-term product vision includes:
- Personal individual workout tracking across all modalities.
- Multi-disciplinary tracking: Running, Strength, Hypertrophy, Hybrid, Hyrox, Cross-training, and WODs.
- Structured training programs, prebuilt program catalogs, and customizable user-built programs.
- Rich exercise knowledge base and technique library.
- Comprehensive progress, body composition, volume, and recovery analytics.
- Intelligent AI Coach providing adaptive programming and workout insights.
- Coach/Client management, workout assignment, and compliance monitoring.
- Multi-user interaction, leaderboards, community challenges, and social features.

> **CRITICAL BOUNDARY:**  
> The long-term direction above represents **PRODUCT VISION ONLY**.  
> It does **NOT** authorize building or scaffolding those future systems now. Any implementation of future roadmap items requires explicit DINO Project Owner authorization and a dedicated Change Set.

---

## 5. Product Preservation

1. **Approved Behavior Preservation:** All existing approved functionality, UI layouts, workout routines, audio cues, timers, offline caching, and historical data flows must be preserved during all development.
2. **Incremental Progression:** Features must evolve incrementally and safely. Existing user experiences must not be degraded or discarded.
3. **No Feature Truncation:** Never delete or bypass an existing capability merely because refactoring or modifying it is challenging.

---

## 6. No Silent Product Decisions

Agents and developers are strictly forbidden from making silent, unilateral decisions regarding:
- Product behavior and workflows.
- User Experience (UX) and navigation hierarchy.
- Data models, schemas, and persistence keys.
- Technical architecture and dependencies.
- Business rules, exercise algorithms, and scoring logic.

**Protocol:** If an implementation requires a meaningful product, UX, architecture, schema, business-rule or scope decision:
**STOP → REPORT → ASK DINO**

---

## 7. No Rebuild / No DINO V2

- **Absolute Prohibition:** Never rebuild, rewrite, replace, or construct a parallel version of DINO (such as "DINO V2", duplicate storage engines, or parallel state managers).
- **Refactoring Boundary:** Code difficulty or legacy patterns do not justify architectural rewrites.
- **Architectural Changes:** Any migration, framework introduction, or architectural change requires explicit, written DINO Project Owner authorization.

---

## 8. Real Data Integrity & Honest Empty States

DINO is built on data truth and athletic honesty:
- **No Fake Data:** Never introduce fake production data, mock progress charts, simulated PRs, artificial workout history, fake calendar heatmaps, or placeholder achievements into operational flows.
- **Honest Empty States:** When a user has zero recorded workouts, PRs, or logs, the application must display clear, informative, and encouraging empty states rather than dummy charts or mocked data points.
- **Single Source of Truth:** Never maintain parallel or duplicate sources of truth for user state, workout history, or profile statistics.

---

## 9. Hierarchy of Source of Truth

When resolving design conflicts, data requirements, or architectural ambiguity, consult the following hierarchy in descending order:

| Level | Authority Source | Description |
| :--- | :--- | :--- |
| **P0** | **DINO Project Owner Decisions** | Explicitly approved decisions and directives from DINO (Project Owner). |
| **P1** | **DINO Product Constitution** | This document ([`00_SYSTEM/DINO_PRODUCT_CONSTITUTION.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/DINO_PRODUCT_CONSTITUTION.md)). |
| **P2** | **Current Repository Implementation** | The active, working implementation and codebase in the repository. |
| **P3** | **Original DINO Product Specification** | Baseline requirements and functional specs established for DINO. |
| **P4** | **BFS Hybrid 2-Week Rotation Source** | The authoritative preset document (`BFS_Hybrid_Athlete_2_Week_Rotation.docx`). |
| **P5** | **Training Science References** | Peer-reviewed exercise science, hybrid conditioning principles, and biomechanics. |
| **P6** | **Technical Documentation** | Library docs, web API standards, and infrastructure guides. |

### Conflict Resolution Rule
- If two sources of truth conflict:
  1. Identify both sources and the exact nature of the contradiction.
  2. Document the trade-offs and options.
  3. Report the conflict to DINO / Product Architect.
  4. **Do not silently choose or invent a rule.**
