# developer agent

Task 3.1 is verified and committed. Now please execute ONLY Task 3.2 (Build CP Proxy for InL / OpenAI & Gemini Processing):

1. In `control_plane`, create an Intelligence Service (`control_plane/app/services/intelligence.py`):
   - Support OpenAI API (using `openai` SDK or `httpx`) as the primary provider with fallback capability for Gemini.
   - Read `OPENAI_API_KEY` (and optional `LLM_PROVIDER=openai`) from environment variables (`.env`).
   - Send the partially-masked text to the LLM for secondary contextual risk evaluation (evaluating intent and indirect/complex sensitive data leakage).
   - Require structured JSON output from LLM containing: `contextual_risk_score`, `detected_intents`, and `recommended_action`.
2. Integrate this Intelligence Service into the `POST /api/v1/guardrail/inspect` endpoint as a secondary evaluation layer.
3. Ensure graceful fallback to local Regex results if the API key is missing, invalid, or if the external API call fails (Fail-Safe architecture).
4. Update `PROGRESS.md` to mark Task 3.2 as completed [x].
--------------------------------
then
--------------------------------
# QA Agent

Task 3.2 is committed and pushed. Now please execute Verification 3.0 for Sprint 3:

1. Create or update test cases (e.g., `control_plane/test_intelligence.py` or within `test_guardrail.py`) to verify:
   - Local Regex engine successfully masks raw PII (emails, phone numbers, Saudi IDs, API keys) before calling LLM proxy.
   - Intelligence Service handles secondary contextual evaluation gracefully when `OPENAI_API_KEY` or `GEMINI_API_KEY` is present.
   - Fail-Safe fallback works seamlessly when external API key is missing or invalid.
2. Run pytest across the whole test suite to ensure 100% pass rate.
3. Update `PROGRESS.md`:
   - Set Current State Snapshot: Active Sprint to "Sprint 3", Current Task to "Verification 3.0", Status to "Completed".
   - Mark Verification 3.0 as completed [x].
   - Update Session Handover Log to confirm Sprint 3 is 100% complete.