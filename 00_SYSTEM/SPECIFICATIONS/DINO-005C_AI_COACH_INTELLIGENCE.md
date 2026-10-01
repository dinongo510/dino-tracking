# DINO-005C — AI Coach Intelligence Layer
## Phase 1 Specification / Implementation Record

Status: IMPLEMENTED ON FEATURE BRANCH — awaiting independent audit and Founder UAT.

### 1. Purpose
DINO-005C turns the existing AI Coach into a governed conversational AI layer that:
- behaves as a general-purpose AI assistant, not only a training-database chatbot;
- can use the current user's authorized DINO training context when relevant;
- clearly distinguishes AI-connected, offline, error and blocked states;
- preserves DINO-005B as deterministic ground truth;
- never mutates prescriptions, actual performance, workout history, corrective dosage or laterality.

### 2. P0 Architectural Invariant — User Data Isolation
**DINO AI Coach is a general-purpose conversational AI with access to the current user's authorized training context. Personal training data is user-scoped and must never be treated as global AI memory or shared across users.**

Required future boundary: Authentication → Current User → User-scoped Data Access → Context Engine → AI.

A user's program, prescriptions, actual performance, history, prehab profile, preferences and AI chat context must never be supplied to another user's AI context.

The Phase 1 browser-only fallback identity is device-local only. It is not presented as authentication and does not claim to solve production multi-user identity. A future authenticated backend/data layer is required for real multi-user isolation.

### 3. Three Knowledge Layers
1. **General AI knowledge** — capabilities of the selected LLM.
2. **DINO product knowledge/rules** — product architecture and deterministic rules.
3. **Current-user personal context** — data assembled at request time by the Context Engine.

Personalization comes from the current-user Context Engine, not from global model memory or cross-user fine-tuning.

### 4. Authority Boundary
DINO-005B remains the deterministic authority for corrective exercise.
AI may explain, summarize, interpret, answer general questions, analyze the user's training data, and provide coaching/adherence guidance.

AI may not generate or replace a corrective routine; alter corrective dosage; infer or alter laterality; override NEEDS_LATERALITY; ignore SAFETY_BLOCKED; modify prescriptions; write actual performance; or mutate immutable workout history.

### 5. Phase 1 Components
- js/ai/model_registry.js — model alias and provider metadata.
- js/ai/task_router.js — intent classification including GENERAL.
- js/ai/context_engine.js — current-user scoped context assembly and relevance shaping.
- js/ai/safety_gate.js — deterministic authority boundary before AI.
- js/ai/gateway.js — provider-neutral AI gateway and explicit status.
- js/ai/providers/gemini_adapter.js — Gemini-specific transport only.
- js/ai/response_validator.js — post-generation authority validation.
- js/ai_coach.js — compatibility/controller layer.
- js/app.js — explicit status presentation.

### 6. AI Status Contract
- AI_CONNECTED: model response returned through provider adapter.
- AI_OFFLINE: no API key / AI not connected; offline state must not be presented as Gemini.
- AI_ERROR: provider/request failure.
- AI_BLOCKED: deterministic gate/validator prevented unsafe authority crossing.

### 7. General AI Contract
A user may ask a free-form question even when it is not directly about training. The system should route it through the normal AI path when connected while adding personal DINO context only when relevant and authorized.

The AI must state when required personal data is unavailable rather than inventing it.

### 8. Context Contract
The request context includes, where available: current user scope identifier; current program/version/week/day; current prescription snapshot for the active day; recent completed training; aggregate training statistics; prehab profile; current user query and task.

PRESCRIPTION != ACTUAL remains explicit. Prescription is plan data; actual performance is completed-session data.

### 9. Current Provider Decision
Phase 1 retains the existing browser-direct Gemini integration and gemini-2.5-flash model through a provider adapter. API-key storage remains the existing LocalStorage mechanism.

This is a Phase 1 compatibility decision, not a claim that browser LocalStorage is the final production security architecture.

### 10. Acceptance Criteria
1. A general free-form question reaches the AI path when Gemini is connected.
2. A personal training question receives current-user context.
3. The context contains the active prescription without converting it into actual performance.
4. No data from another user can be selected by the Context Engine.
5. No global athlete memory is created.
6. No AI response can mutate prescription/history/actual performance.
7. NEEDS_LATERALITY and SAFETY_BLOCKED remain authoritative.
8. No API-key/no-provider state is mislabeled as AI.
9. Provider-specific transport remains behind the gateway/adapter boundary.
10. Existing DINO-005A and DINO-005B behavior remains unchanged.
11. The UI exposes AI_CONNECTED, AI_OFFLINE, AI_ERROR, or AI_BLOCKED.
12. The Phase 1 implementation does not introduce a multi-user backend claim that is not actually implemented.

### 11. Explicit Non-Goals
- OpenAI implementation in Phase 1.
- Provider marketplace / 40+ provider ecosystem.
- OAuth or account pooling.
- Streaming/SSE.
- Autonomous program generation.
- AI-generated corrective routines.
- Automatic prescription or load modification.
- Replacement of DINO-005B.
- Global/shared athlete memory.

### 12. Traceability
- DINO-005A / 005B: deterministic program and corrective foundations.
- 9Router learning: gateway, provider adapter, model registry, task routing, context engine, safety gate, response validation and explicit resilience boundary.
- Founder requirement: general-purpose AI + current-user personal training context + future multi-user isolation.
