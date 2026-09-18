# developer agent

Task 5.2 is completed and committed. Let's start Task 5.3: Sentry & Structured Logging Integration.

Please review the requirements in docs/prompts/sprint5/ for Task 5.3 and implement the following:

1. Control Plane (Backend):
   - Configure Sentry SDK in FastAPI (`control_plane/app/main.py` or core config).
   - Set up structured JSON logging for request traces, rule evaluations, and audit events.
   - Ensure sensitive user prompts/PII are stripped or masked before sending errors to Sentry.

2. Interception Layer (Extension):
   - Integrate Sentry for Browser Extensions (or lightweight error logging handler) in `background.js` and `content.js`.
   - Ensure error logs contain minimal metadata without leaking prompt contents.

3. Verification:
   - Verify log structures and test triggering a handled exception to ensure clean error tracking without PII leakage.
   - Run existing pytest suite (`PYTHONPATH=. ./control_plane/.venv/bin/pytest control_plane`) to ensure zero regressions.

Please present the architecture plan for Task 5.3 before applying the changes.
------------------------
then
------------------------
# developer agent

The architecture plan for Task 5.3 is fully approved! 

Please proceed with the implementation:

1. Control Plane:
   - Create `control_plane/app/core/logging.py` for JSON formatting and PII scrubbing filters.
   - Attach the structured logging middleware and initialize Sentry with `before_send` stripping in `control_plane/app/main.py`.
   - Ensure auth tokens and raw prompts are strictly excluded from Sentry/Log sinks.

2. Interception Layer:
   - Create `interception_layer/logger.js` and integrate with `background.js` and `content.js`.
   - Set up the lightweight error-reporting mechanism to the CP.

3. Verification:
   - Trigger a sample handled error to verify Sentry event scrubbing.
   - Run existing tests to ensure zero regressions:
     `PYTHONPATH=. ./control_plane/.venv/bin/pytest control_plane`
