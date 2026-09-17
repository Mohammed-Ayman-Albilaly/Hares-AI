# developer agent

Sprint 1 and Verification 1.0 are officially complete and verified on WSL2 (Ubuntu 24.04).



We are now ready to begin Sprint 2: Core Data Guardrail & Interception Engine.



Please start with Task 2.1: Interception Engine Core (Regex & Pattern Matcher):

1. Create a dedicated core module `guardrail_engine` (or inside `control_plane/app/core`).

2. Build the pattern matching engine for detecting sensitive data (PII like Emails, Phone Numbers, Credit Cards, API Keys, and Secrets).

3. Implement the inspection function that takes a prompt payload and returns risk severity, detected entities, and masked prompt content.

4. Update `PROGRESS.md` to mark Task 2.1 as [/] In Progress.
--------------------------------
then
--------------------------------
# QA agent

Please create a comprehensive unit test suite test_guardrail.py inside control_plane to verify the new guardrail_engine:



Test PII pattern detection for:

Emails

Phone numbers

Credit cards

API keys & secrets



Test risk severity calculation logic (Low, Medium, High, Critical).

Test text masking behavior to ensure offset replacement is correct and sensitive data is fully redacted.

Run the test suite and confirm all assertions pass.
