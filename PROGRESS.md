# Hares AI: Project Execution & Progress Tracker

> **Notice for AI Agent:** Read this file at the start of every session to identify current state. Update this file continuously after completing tasks or at the end of every session.

---

## 📌 Current State Snapshot
- **Active Sprint:** Sprint 1 - The Identity & Deterministic Foundation
- **Current Task:** Task 1.1 Project Initialization & Docker Setup
- **Status:** Pending / Not Started
- **Last Updated:** 2026-09-17

---

## 🗂️ Detailed Task Checklist

### Sprint 1: The Identity & Deterministic Foundation
- [x] **Task 1.1:** Initialize FastAPI Backend directory structure & Docker Compose setup (`PostgreSQL` + `Redis`).
- [x] **Task 1.2:** Configure SQLAlchemy v2 models, Pydantic schemas, and Alembic migrations for Users & Roles.
- [x] **Task 1.3:** Build CP Authentication Endpoints (`/api/v1/auth/login`, `/api/v1/auth/validate`).
- [x] **Task 1.4:** Build Extension Auth Gate (Manifest V3 Service Worker + `chrome.storage.local` JWT handling).
- [x] **Task 1.5:** Build Admin Dashboard Auth views (React + Vite + Shadcn Login Form).
- [x] **Verification 1.0:** Execute Sprint 1 Verification Cases (Token issuing, storage, and basic prompt blocking).

### Sprint 2: The Management Hub (Dynamic Sync & Audit)
- [x] **Task 2.1:** Implement CP Rule Management APIs (General & Departmental rules).
- [x] **Task 2.2:** Build Audit Log Ingestion Engine in CP.
- [x] **Task 2.3:** Build Extension Rule Sync Mechanism (Local cache + periodic sync).
- [ ] **Task 2.4:** Build Admin Dashboard Rule Configuration & Audit Log Review UI.
- [ ] **Verification 2.0:** Verify Dept-specific rule enforcement and audit trails.

### Sprint 3: The Intelligence Integration (AI Fallback)
- [ ] 🚨 **User Action Required:** Request Intelligence Layer (InL) API Keys.
- [ ] **Task 3.1:** Build Local Regex / Masking Engine inside Extension (IL).
- [ ] **Task 3.2:** Build CP Proxy for InL processing.
- [ ] **Verification 3.0:** Verify zero raw PII reaches external InL endpoints.
- [ ] **Verification 3.0:** Verify zero raw PII reaches external InL endpoints.

### Sprint 4: The Compliance Suite (Justification & Rewrites)
- [ ] **Task 4.1:** Build Extension Justification Dialog UI.
- [ ] **Task 4.2:** Build Privacy-Preserving Prompt Rewrite Engine.
- [ ] **Verification 4.0:** End-to-End Test: Block -> Justify -> Rewrite -> Audit Log.

### Sprint 5: Production Readiness & Hardening
- [ ] **Task 5.1:** Implement Redis-backed Token Blacklisting & `slowapi` Rate Limiting in CP.
- [ ] **Task 5.2:** Implement Fail-Closed policy & Circuit la Breaker in IL.
- [ ] **Task 5.3:** Integrate Sentry & Structured Logging.
- [ ] **Task 5.4:** Configure GitHub Actions CI/CD and production deployment scripts.
- [ ] 🚨 **User Action Required:** Request Chrome Web Store / Enterprise GPO access.
- [ ] **Verification 5.0:** Chaos Testing, Load Testing, and Production Rollout.

---

## 📝 Session Handover Log

```yaml
Session Date: 2026-09-17
Last Completed Task: Task 2.2 (Audit Log Ingestion)
Modified Files:
  - control_plane/app/main.py
  - control_plane/test_audit.py
Next Action: Task 2.3 (Extension Rule Sync Mechanism)
Notes/Blockers: Fixed import errors in main.py and updated test assertions to match engine behavior.
```
