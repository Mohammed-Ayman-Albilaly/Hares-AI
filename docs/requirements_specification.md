## Requirements Specification: Hares AI - AI Data Guardrail Framework

### Business Context
Organizations are increasingly adopting Large Language Models (LLMs) like ChatGPT, Gemini, and Claude. However, employees often inadvertently share sensitive corporate data (PII, API keys, financial records) in prompts, leading to critical data leaks. Hares AI solves this by implementing a client-side Data Loss Prevention (DLP) layer that intercepts and analyzes prompts on-device, ensuring that sensitive data never leaves the local trust boundary.

### Goals & Success Metrics
- **Goal**: Prevent unauthorized transmission of sensitive data to AI platforms.
- **Success Metric 1**: 0% raw sensitive data leakage to cloud AI APIs.
- **Success Metric 2**: < 500ms total latency for the end-user during interception.
- **Success Metric 3**: Reduction in false positives through admin-led rule refinement.

### Stakeholders
- **End User**: Needs a seamless AI experience while being guided on data security.
- **Department Admin**: Needs visibility into risk trends within their team and the ability to justify overrides.
- **System Admin**: Needs global control over detection rules and security policies.
- **Compliance/Security Officer**: Needs an audit trail of blocked attempts and justified overrides.

### Scope
**In scope:**
- **Client-Side Interception**: Intercepting prompts on supported AI platforms.
- **Multi-Stage Detection**: Local Regex (Deterministic) $\rightarrow$ Masked AI Classification (Probabilistic).
- **Dynamic Rule Engine**: Remote synchronization of detection patterns from a central server.
- **Risk-Based Enforcement**: Four-tier response (Allow, Info, Warn, Block).
- **Justified Overrides**: Requiring business reasoning for bypassing "Medium" warnings.
- **Feedback Loop**: Mechanism for users to report false positives.
- **Privacy-Preserving Rewrites**: Local masking $\rightarrow$ Cloud rewrite $\rightarrow$ Local unmasking.
- **Audit Dashboard**: Role-based access to anonymized metadata logs.

**Out of scope:**
- **Network-level Packet Inspection**: This is a browser-level tool, not a firewall.
- **Direct LLM Integration**: The system does not replace the LLM; it guards the input.
- **Non-Browser AI Clients**: Desktop apps or API-based integrations (outside Chrome).

### User Stories

#### 1. Dynamic Rule Sync
As a **System Admin**, I want to update detection patterns in the dashboard and have them apply to all users instantly, so that I can respond to new security threats without requiring an extension update.
- **Given** a new regex pattern is added to the Admin Dashboard, **When** the extension performs its periodic sync (or restarts), **Then** the new pattern is applied to all local scans.

#### 2. Justified Overrides
As a **Compliance Officer**, I want to know why a user bypassed a security warning, so that I can determine if the action was a legitimate business need or a policy violation.
- **Given** a prompt is flagged as "Medium Risk", **When** the user selects "Proceed Anyway", **Then** the system must prompt for a text-based justification before allowing the prompt to be sent.

#### 3. False Positive Reporting
As an **End User**, I want to report a prompt that was incorrectly blocked, so that the system can be improved and my productivity is not hindered.
- **Given** a prompt is blocked/warned, **When** the user clicks "Report False Positive", **Then** a masked version of the prompt and the rule ID are sent to the Admin Review Queue.

#### 4. Privacy-Preserving Rewrite
As an **End User**, I want my sensitive prompt to be rewritten into a safe version without the AI ever seeing my actual private data, so that I can get the help I need without compromising security.
- **Given** a blocked prompt, **When** the user requests a "Safe Rewrite", **Then** the system masks sensitive values locally $\rightarrow$ sends masked text to AI $\rightarrow$ receives rewritten masked text $\rightarrow$ restores original values locally.

### Prioritization (MoSCoW)
- **Must have**:
    - Local Regex Detection
    - Risk-Based Enforcement (Block/Warn/Allow)
    - Local Masking for AI Fallback
    - Remote Rule Sync (Dynamic Rules)
    - Basic Audit Logging
- **Should have**:
    - Justified Overrides for Medium Risk
    - Privacy-Preserving Rewrite Workflow
    - False Positive Reporting
- **Could have**:
    - Department-specific rule sets
    - Advanced analytics on risk trends
- **Won't have (this time)**:
    - Support for non-Chrome browsers
    - Integration with corporate LDAP/Active Directory

### Assumptions
- The Gemini API will be used as the secondary classifier and rewrite engine.
- Users will have a stable internet connection for rule syncing and AI fallback.
- The "Masking" process is robust enough to prevent AI "de-masking" or guessing of sensitive data.

### Open Questions
- What is the optimal frequency for the extension to sync rules from Firebase?
- Should "High Risk" blocks ever be overridable by a System Admin locally?
- How should the system handle extremely long prompts that might exceed AI token limits during the rewrite process?

### Recommended Next Steps
- **Handoff to Planner**: Design the implementation strategy for the Dynamic Rule Sync and the Masked Rewrite pipeline.
- **QA Focus**: Focus on the "Zero-Knowledge" guarantee—verify that no raw sensitive data is sent during the Rewrite or Classification phases.
