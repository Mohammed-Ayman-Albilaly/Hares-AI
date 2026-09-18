# developer agent

Task 4.1 is now fully closed and verified end-to-end. Let's start Task 4.2: Build Privacy-Preserving Prompt Rewrite Engine.

First, update PROGRESS.md to set Current Task to Task 4.2 (In Progress).

Then, execute Task 4.2 according to the project specifications:
1. Engine Core: Implement a privacy-preserving rewrite engine (in control_plane or interception_layer as designed) that automatically transforms high-risk/sensitive prompts into safe, sanitized versions before sending them to LLM APIs.
2. Context Retention: Ensure entities and sensitive data are masked or replaced while preserving the intent and semantics of the prompt.
3. Extension Integration: Connect the rewrite flow to the interception layer so users can preview or automatically apply rewritten prompts.
4. Testing: Add test cases to verify prompt sanitization, structure preservation, and overall functionality.
5. Update PROGRESS.md upon completion [x].
-------------------------------
then
-------------------------------
# QA agent

Please perform the QA and behavior verification for Task 4.2 (Privacy-Preserving Prompt Rewrite Engine):

1. Logic & Verification Check:
   - Verify the functionality of `interception_layer/rewrite_engine.js` and run the `rewrite_tests.js` test suite.
   - Confirm that sensitive entities (Emails, API Keys, Phones, etc.) are correctly sanitized while preserving original prompt intent.

2. Integration & Flow Verification:
   - Check if the "Use Rewrite" action in the dialog UI correctly replaces the text in the prompt input field.
   - Verify that all existing backend pytest cases (12/12) still pass without regressions.

3. Provide a summary table of your QA findings and recommendation on whether we are ready for Task 4.3 or if any backend/frontend gaps exist.
-----------
then
---------
# developer agent

QA identified a critical bug in Task 4.2 regarding index offset shifting during prompt rewrite in `interception_layer/rewrite_engine.js`.

Please fix the `RewriteEngine.rewrite` logic:

1. Root Cause:
   Applying original `entity.start` and `entity.end` offsets directly to a mutated string causes invalid slicing when multiple entities exist or replacement lengths differ.

2. Solution Requirement:
   Refactor the `rewrite` method using a robust replacement strategy (e.g., sorting entities by `start` index descending before replacing, or constructing the result by array fragment joining based on original offsets).

3. Verification:
   - Run `interception_layer/rewrite_tests.js` and ensure 4/4 tests pass.
   - Run existing backend tests (`pytest control_plane`) to ensure no regressions (12/12 pass).
   - Once verified and fixed, provide the updated code summary so we can proceed to QA re-verification.

--------------
then
--------------
# QA agent

The developer has refactored `interception_layer/rewrite_engine.js` using a fragment-joining strategy to resolve the index offset bug. 

Please perform the final QA re-verification for Task 4.2:

1. Verification Run:
   - Re-run `interception_layer/rewrite_tests.js` to confirm all 4/4 test cases pass without text corruption.
   - Verify that multiple entities within the same prompt are replaced cleanly while preserving the surrounding semantic intent.

2. End-to-End Checklist:
   - Confirm Extension UI and Control Plane backend stability.
   - Verify if we are fully clear to mark Task 4.2 complete in `PROGRESS.md` and move forward to Task 4.3.