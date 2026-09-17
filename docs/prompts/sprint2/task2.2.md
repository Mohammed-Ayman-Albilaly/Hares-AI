# developer agent

Task 2.1 is completed. Now please execute ONLY Task 2.2 (Audit Log Ingestion Engine in CP):

1. Create a SQLAlchemy model for Audit Logs (`AuditLog`) in `control_plane/app/models/audit.py`. It should store: prompt_id, user_id (optional), timestamp, risk_severity, detected_entities (JSON), and the original prompt (optional/encrypted based on rules).
2. Create Pydantic schemas in `control_plane/app/schemas/audit.py`.
3. Update the `POST /api/v1/guardrail/inspect` endpoint in `rules.py` (or a dedicated `audit.py` router) to asynchronously write an AuditLog record to PostgreSQL using SQLAlchemy after an inspection is completed.
4. Update `PROGRESS.md` to mark Task 2.2 as completed [x].