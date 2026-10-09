# VOICE ROOTS — DATABASE MIGRATION SAFETY GUARD
==============================================
Use these rules for EVERY database schema or data migration.

1. INSPECT FIRST
----------------
Before creating a migration:
- inspect the current schema
- inspect existing migrations
- inspect models/entities
- inspect foreign keys
- inspect indexes
- inspect existing data
- identify application code using the affected fields
Never assume the current schema.

2. NEVER MODIFY PRODUCTION DIRECTLY
------------------------------------
Never manually edit production tables.
Never run destructive SQL directly against production.
Use the project's existing migration system.

3. USE EXPAND → MIGRATE → CONTRACT
-----------------------------------
For potentially breaking changes:
PHASE A — EXPAND
Add the new structure without removing the old structure.
PHASE B — MIGRATE
Backfill/transform existing data and update application code.
PHASE C — CONTRACT
Only after the application no longer depends on the old structure,
remove the old structure.
Do not combine a risky expand and contract into one uncontrolled change.

4. EXAMPLE
----------
If changing:
published
to:
status
DO NOT immediately delete published.
Instead:
OLD:
published
EXPAND:
published + status
MIGRATE:
copy/transform existing values
APPLICATION:
read/write status
VERIFY:
no application code depends on published
CONTRACT:
remove published

5. DATA PRESERVATION
--------------------
Before migration:
- identify affected rows
- determine expected transformation
- preserve IDs
- preserve relationships
- preserve timestamps where appropriate
- preserve provenance
- create a backup/snapshot where appropriate
Never silently discard data.

6. NULLABILITY
--------------
Do not suddenly add NOT NULL to an existing populated table unless
existing rows have been safely populated first.
Safe sequence:
add nullable/default field
→ backfill
→ validate
→ update application
→ add constraint if appropriate

7. ENUM / STATUS CHANGES
------------------------
For Voice Roots workflow states:
Do not rename/remove a state that existing records may use without
a migration strategy.
Validate all existing values before changing constraints.
Never silently convert:
VERIFIED
to
PUBLISHED
unless the product workflow explicitly requires that transition.

8. FOREIGN KEYS
---------------
Before adding a foreign key:
- identify orphaned records
- resolve invalid references
- validate cardinality
- create the constraint only after data is clean
Never delete orphaned records automatically.

9. INDEXES
----------
For large Voice Roots tables:
Create indexes for frequently queried fields.
Examples:
story.sourceLanguageId
story.stateId
story.districtId
story.localityId
language_locations.languageId
language_locations.localityId
For large production indexes, consider the database's
non-blocking/concurrent index capabilities where appropriate.

10. MIGRATION FILES
-------------------
Every migration must be:
- versioned
- committed to Git
- reproducible
- reviewable
- deterministic
- environment-safe
Never edit an already-applied migration to change history.
Create a new migration instead.

11. DATA MIGRATIONS
-------------------
If schema changes require data transformation:
separate schema change
from
data transformation
unless the project's migration framework safely supports both.
The transformation must be:
- deterministic
- idempotent where practical
- testable
- reversible where practical

12. VOICE ROOTS CULTURAL DATA
-----------------------------
NEVER transform original cultural data destructively.
Never modify:
original audio
original language
original contributor identity
original location provenance
without an explicit product requirement and migration plan.

13. INDIA LANGUAGE DATA
-----------------------
When importing Census or administrative data:
preserve:
sourceId
sourceYear
sourceReference
officialCode
geographyVersion
verificationStatus
Do not merge historical Census geography into current geography.
Do not overwrite historical records.

14. MIGRATION TESTING
--------------------
Every migration must be tested against:
- empty database
- representative development database
- realistic existing data
- duplicate data where relevant
- invalid/orphaned data where relevant
Verify:
before count
after count
relationships
indexes
constraints
data values

15. ROLLBACK / RECOVERY
-----------------------
Before a risky migration, identify:
- rollback strategy
- backup strategy
- recovery strategy
- affected tables
- affected application versions
If rollback cannot safely restore the previous state,
explain why before implementation.

16. PRODUCTION CHECK
--------------------
Before production:
[ ] Migration reviewed
[ ] Backup/snapshot available where appropriate
[ ] Development migration successful
[ ] Test migration successful
[ ] Existing data validated
[ ] Application compatibility verified
[ ] API compatibility verified
[ ] Rollback/recovery plan understood

17. STOP CONDITIONS
-------------------
STOP and ask for approval if the migration:
- drops a table
- drops a column
- changes a primary key
- changes existing IDs
- removes user data
- changes foreign-key relationships
- changes authentication tables
- changes workflow states
- changes original cultural records
- requires manual production SQL

18. REPORT
----------
After migration work, report:
Migration name
Tables affected
Columns affected
Data transformed
Rows affected
Indexes affected
Constraints affected
Application changes
Tests performed
Test results
Rollback/recovery plan
Known risks

19. FINAL RULE
--------------
NEVER:
change production schema blindly
+
delete data
+
hope the application still works
ALWAYS:
INSPECT
→ PLAN
→ EXPAND
→ MIGRATE
→ VALIDATE
→ SWITCH APPLICATION
→ TEST
→ CONTRACT
→ CHECKPOINT
