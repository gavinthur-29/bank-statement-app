# Ingestion Contract (v1)

## Purpose
Defines the guaranteed, intentional behaviour of the ingestion layer for v1.
This contract is enforced by code and relied upon by downstream systems.

---

## Core Rules

1. **One upload = one accountKey**
   - Every uploaded file is treated as a distinct bank account.
   - No attempt is made to deduplicate, merge, or reconcile accounts across uploads.

2. **accountKey scope**
   - accountKey is generated at ingestion time.
   - accountKey is request-scoped and unique per upload.
   - accountKey is never derived from filename, checksum, or content.

3. **Stability**
   - accountKey remains stable throughout:
     - parsing
     - consolidation
     - ledger export
   - accountKey is attached to every transaction row.

4. **Non-goals (explicitly out of scope for v1)**
   - Cross-upload account reconciliation
   - Bank account identity inference
   - Historical account linking

---

## Failure Rules

- Ingestion MUST fail if accountKey cannot be generated.
- Ingestion MUST fail if accountKey is missing or invalid.
- Downstream stages may assume accountKey is always present.

---

## Future Work (v2+)

Any change to account identity behaviour MUST:
- Be explicitly versioned
- Update this contract
- Include migration logic


