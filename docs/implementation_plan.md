# Hares AI: Master Implementation Plan

## 🎯 System Vision
An identity-driven, role-based AI Data Guardrail Framework. The system ensures that only authenticated users can access AI platforms through the Interception Layer, and all actions are tied to a specific identity for auditing and granular policy enforcement.

---

## 🏗️ Functional Architecture
1. **Interception Layer (IL)**: Browser-based agent. Handles Auth, Local Detection, Masking, and UI.
2. **Control Plane (CP)**: Backend API. Handles JWT issuance, Rule Distribution, and Audit Log ingestion.
3. **Administrative Interface (AI)**: Web Dashboard. Handles User Management, Rule Configuration, and Audit Review.
4. **Intelligence Layer (InL)**: External AI services for probabilistic classification and safe rewrites.

---

## 🔐 Identity & Access Management (IAM) Logic
- **Authentication**: Email/Password $\rightarrow$ CP $\rightarrow$ JWT (containing `UserID`, `DeptID`, `Role`).
- **Persistence**: JWT stored in `chrome.storage.local`.
- **Authorization**: Every API request from IL to CP must include the JWT in the request header.
- **Policy Mapping**: 
    - `General Rules` $\rightarrow$ Applied to all authenticated users.
    - `Dept Rules` $\rightarrow$ Applied only if `Token.DeptID == Rule.DeptID`.
- **Lifecycle**: Account deactivation in the AI (Dashboard) immediately invalidates the token, disabling the IL.

---

## 🔄 Agile Implementation Roadmap

### Sprint 1: The Identity & Deterministic Foundation
**Goal**: Establish the Auth gate and the basic "Intercept $\rightarrow$ Block" flow.

#### 1. Documentation & Design
- Define the **User Schema** (UserID, Email, PasswordHash, DeptID, Role, Status).
- Define the **JWT Payload** and encryption standard.
- Design the **Login UI** for the Interception Layer.

#### 2. Development
- **CP**: Implement User Registry and Auth API (`/login`, `/validate-token`).
- **IL**: Implement the **Auth Gate**:
    - Check for token on startup.
    - If missing/invalid $\rightarrow$ Redirect to Login Page.
    - On success $\rightarrow$ Store JWT and enable interception.
- **IL**: Implement basic Prompt Capture and Local Regex Engine.
- **AI (Dashboard)**: Implement **User Management** (Create/Edit/Deactivate users).

#### 3. Deployment
- Deploy CP and AI to cloud hosting.
- Deploy IL as a browser extension.

#### 4. Verification
- **Test Case**: Install extension $\rightarrow$ Verify it is disabled until login.
- **Test Case**: Login with valid credentials $\rightarrow$ Verify token is stored and rules are fetched.
- **Test Case**: Deactivate user in Dashboard $\rightarrow$ Verify extension stops working on next request.

---

### Sprint 2: The Management Hub (Dynamic Sync & Audit)
**Goal**: Centralized rule control and identity-linked auditing.

#### 1. Documentation & Design
- Define the **Rule Schema** (Regex, RiskLevel, DeptID [Optional]).
- Design the **Audit Log Schema** (UserID, DeptID, RuleID, Timestamp, Action).

#### 2. Development
- **CP**: Implement Rule Management API and Telemetry Ingestion.
- **AI (Dashboard)**: 
    - **Rule Editor**: Create/Edit rules (with Dept-specific targeting).
    - **Audit Viewer**: Filter logs by User, Department, or Risk Level.
- **IL**: Implement **Identity-Linked Telemetry** (Attach JWT to every log sent to CP).
- **IL**: Implement **Contextual Rule Sync** (CP returns rules based on the token's DeptID).

#### 3. Deployment
- Update AI (Dashboard) with Rule/Log modules.
- Update IL to support identity-linked syncing.

#### 4. Verification
- **Test Case**: Assign a rule to "Finance Dept" $\rightarrow$ Verify only Finance users are blocked by it.
- **Test Case**: Trigger block $\rightarrow$ Verify Dashboard shows "User Ahmed (Finance) was blocked."

---

### Sprint 3: The Intelligence Integration (AI Fallback)
**Goal**: Privacy-preserving probabilistic detection.

#### 1. Documentation & Design
- Define the **Local Masking Algorithm** (PII $\rightarrow$ Token).
- Design the **Classification Prompt** for the Intelligence Layer.

#### 2. Development
- **IL**: Implement the **Local Masking Engine**.
- **CP**: Implement an **InL Proxy** (IL $\rightarrow$ CP $\rightarrow$ InL) to protect API keys and log the AI's decision.
- **IL**: Implement the "Inconclusive" flow (Local Regex $\rightarrow$ Mask $\rightarrow$ CP Proxy $\rightarrow$ Action).
- **AI (Dashboard)**: AI Configuration Panel (Adjust sensitivity).

#### 3. Deployment
- Configure InL API keys in the CP.
- Update IL with the masking pipeline.

#### 4. Verification
- **Test Case**: Send ambiguous prompt $\rightarrow$ Verify it is masked before leaving the device.
- **Security Audit**: Confirm no raw PII reaches the Intelligence Layer.

---

### Sprint 4: The Compliance Suite (Justification & Rewrites)
**Goal**: User productivity and high-fidelity auditing.

#### 1. Documentation & Design
- Design the **Justification Workflow** and **Rewrite Pipeline**.

#### 2. Development
- **IL**: Implement **Justification Dialog** for Medium-risk prompts.
- **IL**: Implement **Privacy-Preserving Rewrite** (Local Mask $\rightarrow$ InL $\rightarrow$ Local Unmask).
- **IL**: Implement "Report False Positive" button.
- **CP**: Store justifications linked to UserID; manage False Positive queue.
- **AI (Dashboard)**: **Review Queue** for justifications and false positive reports.

#### 3. Deployment
- Final UI/UX polish for the Interception Layer.
- Final feature release for the Administrative Interface.

#### 4. Verification
- **Test Case**: Block $\rightarrow$ Justify $\rightarrow$ Rewrite $\rightarrow$ Audit (End-to-End).
- **Test Case**: Report False Positive $\rightarrow$ Admin updates rule $\rightarrow$ Verify fix in IL.

---

## 🛠️ Agent Coordination Matrix

| Phase | Developer Agent | QA Agent | DevOps Agent |
| :--- | :--- | :--- | :--- |
| **Doc** | Implement API Contracts | Define Test Scenarios | Define Infra Requirements |
| **Dev** | Code IL, CP, and AI | Unit/Integration Testing | Setup CI/CD Pipelines |
| **Deploy** | Finalize Build | Regression Testing | Cloud Deployment & Monitoring |
| **Verify** | Bug Fixing | Zero-Knowledge Audit | Performance Benchmarking |
