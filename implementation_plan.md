# Hares AI: Master Implementation Plan

## 🎯 System Vision

An identity-driven, role-based AI Data Guardrail Framework. The system ensures that only authenticated users can access AI platforms through the Interception Layer, and all actions are tied to a specific identity for auditing and granular policy enforcement.

---

## 🛠️ Technical Stack (Approved)

### 1. Presentation Layer

- **Admin Dashboard (AI Interface)**: React.js + Vite + Tailwind CSS + Shadcn UI.
- **Interception Layer (IL)**: Chrome Extension (Manifest V3) using Vanilla JavaScript / TypeScript.

### 2. Business Logic Layer

- **Control Plane (CP - Backend API)**: Python with **FastAPI**.
  - **Validation**: Pydantic.
  - **Rate Limiting**: Slowapi / Redis-backed rate limiting.
- **Extension Logic**: Service Workers (Background Script) + Content Scripts.

### 3. Data Access & Layer

- **ORM**: SQLAlchemy (v2) with **Alembic** for migrations.
- **Cache**: `redis-py` (async).
- **Relational DB**: PostgreSQL.
- **In-Memory Store**: Redis.
- **Client Storage**: `chrome.storage.local`.

### 4. Infrastructure

- **Local Dev**: Docker Compose (PostgreSQL + Redis).
- **Production**:
  - **DB**: Managed PostgreSQL (Supabase or Neon).
  - **Cache**: Managed Redis (Upstash).
  - **Backend**: Render or Railway (Dockerized).
  - **Dashboard**: Vercel or Netlify.

---

## 🚨 Mandatory Execution Policy: User Action Requests

**The AI Agent MUST STOP and explicitly request the user (Mohammed) to complete the following actions before proceeding with the corresponding tasks:**

1. **Third-Party API Keys**: Requesting keys for the Intelligence Layer (InL - e.g., OpenAI / Anthropic).
2. **Managed Cloud Databases**: Requesting project creation on Supabase/Neon and Upstash, and the resulting connection strings.
3. **Cloud Deployment Platforms**: Requesting account linking/tokens for Vercel and Render/Railway.
4. **Distribution Access**: Requesting Chrome Web Store developer accounts or Enterprise GPO admin access.

**Protocol:**

- Generate `.env.example` files for all services.
- All schema changes **must** use Alembic migration scripts.
- Wait for user confirmation and verification after every "User Action Required" step.

---

## 🏗️ Functional Architecture

... [Existing Architecture content] ...

## 🔐 Identity & Access Management (IAM) Logic

... [Existing IAM content] ...

---

## 🔄 Agile Implementation Roadmap

### Sprint 1: The Identity & Deterministic Foundation

**Goal**: Establish the Auth gate and the basic "Intercept $\rightarrow$ Block" flow.

- **User Action Required**: Request local Docker environment confirmation and initial DB schema approval.
- **Dev**: Implement FastAPI CP, React Dashboard, and Chrome Extension Auth Gate.
- **Verification**: Verify token storage and basic blocking.

### Sprint 2: The Management Hub (Dynamic Sync & Audit)

**Goal**: Centralized rule control and identity-linked auditing.

- **Dev**: Implement Rule Management API, Audit Log ingestion, and Dashboard Rule Editor.
- **Verification**: Verify Dept-specific rule application.

### Sprint 3: The Intelligence Integration (AI Fallback)

**Goal**: Privacy-preserving probabilistic detection.

- **User Action Required**: **Request API Keys for Intelligence Layer (InL)**.
- **Dev**: Implement Local Masking Engine and CP Proxy for InL.
- **Verification**: Confirm no raw PII reaches the InL.

### Sprint 4: The Compliance Suite (Justification & Rewrites)

**Goal**: User productivity and high-fidelity auditing.

- **Dev**: Implement Justification Dialogs and Privacy-Preserving Rewrites.
- **Verification**: End-to-end flow: Block $\rightarrow$ Justify $\rightarrow$ Rewrite $\rightarrow$ Audit.

### Sprint 5: Production Readiness & Hardening

**Goal**: Ensure the system is secure, observable, and resilient.

- **User Action Required**: **Request Cloud Account Credentials (Supabase/Neon, Upstash, Render/Railway, Vercel)**.
- **Security**: Implement Redis-backed Token Blacklisting and API Rate Limiting.
- **Resilience**: Implement **Fail-Closed** policy and Circuit Breakers.
- **Observability**: Integrate Sentry and CloudWatch/ELK.
- **Deployment**: Execute CI/CD pipeline and Enterprise GPO distribution.
- **User Action Required**: **Request Chrome Web Store / Enterprise Admin access for final rollout**.

---

## 🛠️ Agent Coordination Matrix

... [Existing Matrix content] ...
