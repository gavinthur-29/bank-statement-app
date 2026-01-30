# AI Usage Policy

- Do not use AI for deterministic logic:
  sorting, parsing, consolidation, balances, date handling, file IO, email templates.

- AI is allowed only for:
  - Ledger description matching fallback
  - Optional PDF text cleanup

- Default model must be gpt-4.1-mini (or cheapest equivalent).
- Max tokens per request: 300.
- Temperature: 0.

# App Summary
This app allows users to upload bank statements and credit card statements (PDF, CSV, Excel) to detect missing accounting periods, consolidate files, draft formal missing-period emails, and generate PAY (Money Out) and REC (Money In) CSV files for ledger import. The app has two roles: normal users and admin users with additional management permissions.


# Constraints
- Only build the features explicitly defined in this document.
- Do not add dashboards, analytics, automation, or extra features.
- Maximum file upload size: 25 MB per file.
- Accepted input formats: PDF (native text and scanned), CSV (UTF-8), XLSX.
- Internal processing canonical date format: YYYY-MM-DD (ISO) for parsing and calculations.
- Exported CSV date format (user-facing / final outputs): DD-MM-YYYY (UK format).
- Monetary values rounded to 2 decimal places.
- All files and records must be associated with a Business Name folder and an Accounting Period folder.


# Roles & Authentication
There are two user roles: Normal User and Admin User.

Authentication:
- Users log in using username and password.
- Password minimum length: 8 characters.
- Use secure password hashing.
- Use JWT-based authentication for session management.


Normal User permissions:
- Can log in and access the Home page.
- Can upload files for Email Function and Ledger Mapping.
- Can view all Business folders and Accounting Period folders.
- Can upload files into any existing Business folder.
- Can download consolidated files and PAY/REC output files from any Business folder.
- Can request deletion of consolidated files by triggering an automatic email to Admins.
- Cannot access Admin pages.


Admin User permissions:
- Can log in and access Admin page.
- Can create new users (set username and password).
- Can promote existing users to Admin role.
- Can deactivate or remove users so they can no longer log in.
- Can view credits usage per user.
- Can view all Business folders and files.
- Can soft-delete consolidated files and business folders.
- Can restore soft-deleted files within 30 days.
- Can permanently delete files after 30 days.

Account creation rules:
- Only Admin users can create accounts.
- No public sign-up page is allowed.


# File Processing Rules
Input file handling:
- Accepted formats: PDF (native text and scanned), CSV (UTF-8), XLSX.
- PDF files with selectable text should be parsed directly.
- Scanned PDF files should be processed using OCR.
- CSV files must be parsed assuming comma delimiter.
- Excel files use the first worksheet only.

Required transaction fields after parsing:
- Transaction Date
- Description
- Amount (positive = money in, negative = money out)
- If input files use separate Debit and Credit columns, convert them into single Amount column using this sign convention.
- Balance (optional)
- Account Number or Credit Card Number (if present)
- Balance may be missing in input files and must be generated during consolidation if absent.


Account key extraction:
- Extract any numeric sequence of 4 or more digits as candidate account number.
- If multiple numbers are present, choose the longest numeric sequence.
- Masked numbers (example: ****1234) are matched using last 4 digits.
- Masked numbers are considered the same account only if bank name or card provider also matches.

Duplicate detection:
- First priority: identical file checksum = duplicate file → ignore second upload.
- Second priority: identical transaction rows (same date, amount, description) → remove duplicates.
- Third priority: fuzzy match using date + amount + description with similarity threshold >= 90% → auto-remove.
- Fuzzy match between 70% and 89% should be flagged but not auto-removed.

Accounting period input:
- User must manually input accounting period start date and end date.
- Period format (user input): DD-MM-YYYY to DD-MM-YYYY.
- Internally convert accounting period dates to ISO YYYY-MM-DD for processing.


Missing period detection:
- A missing period is defined as any full calendar month between the selected start and end dates with zero transactions present.
- Missing months must be calculated separately for each bank account or credit card.

Date handling:
- Accepted input date format: DD-MM-YYYY (UK format)
- Alternative accepted formats:
  - DD/MM/YYYY
  - YYYY-MM-DD
- When parsing uploaded files:
  - Always prioritise DD-MM-YYYY interpretation if ambiguity exists.
- Internal processing format:
  - Convert all dates to ISO format YYYY-MM-DD for sorting and calculations.
- Export format:
  - All output CSV files must use DD-MM-YYYY format.

Output file structure:
- All exported CSV files must use the following column structure in this exact order:
  Type, Ref no, Date, Primary account, Details, Total, VAT, Analysis, Analysis account
- Field mapping rule:
  - Internal Amount field must be written to the output CSV as the Total column.

Business Name input handling:
- Trim whitespace from input.
- Collapse multiple spaces into one.
- Preserve original capitalisation for display.
- Store normalised version internally for matching purposes.

# Consolidation Rules
Transaction ordering:
- All transactions must be sorted in ascending order by Transaction Date.
- If two transactions share the same date, sort by upload timestamp as tie-breaker.

Consolidation behavior:
- Files belonging to the same bank account or credit card must be merged into a single consolidated dataset.
- Files from different accounts must never be merged together.

Balance handling:
- User must input an opening balance before consolidation.
- If an input file contains a Balance column:
  - Calculate a running balance using: previous_balance + Amount.
  - Compare calculated balance with provided Balance column.
  - Display discrepancies row-by-row in the consolidated file.
- If no Balance column exists:
  - Automatically generate a Balance column using the running balance formula.

Rounding rules:
- All calculated balances must be rounded to 2 decimal places.

Output format:
- Consolidated file must be saved as CSV.
- Columns must include at minimum:
  Date, Description, Amount, Balance, Primary Account.



# Storage & Folder Structure
Root storage structure:
- All user files must be stored under a root directory named "user_data".

Business folders:
- Each user can create multiple Business Name folders.
- Business Name folder name must match the user-provided business name exactly when created.

- Before creating a new Business Name folder:
  - System must perform a similarity search against existing Business Name folders.
  - Use case-insensitive comparison.
  - Ignore leading/trailing spaces.
  - Normalise common business suffixes:
    Ltd, Limited, PLC, LLP, Inc, Corporation, Corp, Co.

- Similarity rules:
  - If exact match exists → block creation and prompt user to select existing folder.
  - If similarity score ≥ 85% → display matching Business Name folders in selectable list.
  - User must either:
    - Select existing folder, OR
    - Explicitly confirm creation of a new folder with warning message.

- Business Name folders are shared and visible to all users.
- All users may upload files into any existing Business Name folder.
- Only Admin users may permanently delete Business Name folders.



Accounting period folders:
- Inside each Business Name folder, create Accounting Period folders.
- Folder naming format:
  DD-MM-YYYY_to_DD-MM-YYYY
- Each accounting period folder contains files related only to that period.

Email function storage:
- For single account uploads:
  - Store one consolidated file inside the accounting period folder.
  - Store missing period summary data in the same folder.
- For multiple account uploads:
  - Create one consolidated file per bank account or credit card.
  - Store all consolidated files and missing period summaries inside the same accounting period folder.

Ledger mapping storage:
- Store the consolidated transaction file inside the accounting period folder.
- Store generated PAY and REC CSV files inside the same accounting period folder.

Deletion handling:
- When a user requests deletion:
  - Move the target file or folder into a "deleted" subfolder inside the same Business Name folder.
  - Retain deleted items for 30 days before permanent removal.
- Admins can permanently delete items from the deleted folder at any time.



# Email Output Templates
General rules:
- All generated emails must use formal and professional tone.
- No unnecessary explanations or technical jargon.
- No emojis.
- No marketing language.

Statement type handling:
  - Detect statement type automatically based on uploaded file metadata and content.
  - Allowed values:
    - Bank Statement
    - Credit Card Statement
  - Email wording must dynamically switch between:
  "bank statement" OR "credit card statement"
  depending on detected statement type.
  - Never mention both types in the same email unless multiple account types are present.

Subject line format:
- Always use:
  [Company Name] - missing period

Single account email template:

Greeting:
Dear [Company Name],

Body:
We have reviewed the [Statement Type] provided for the accounting period [Start Date] to [End Date] for account number [Account Number].


We have identified missing statement periods. Please find the missing periods listed below:

[Missing Period List]

Please provide the missing statements so we can complete the consolidation process.

Closing:
Kind regards,

Multiple account email template:

Greeting:
Dear [Company Name],

Body:
We have reviewed the submitted statements for the accounting period [Start Date] to [End Date].


We have identified missing statement periods for the following accounts:

[Account Number 1]
[Missing Period List]

[Account Number 2]
[Missing Period List]

Please provide the missing statements so we can complete the consolidation process.

Closing:
Kind regards,


# Ledger Mapping Rules
Input restrictions:
- Only CSV and XLSX files are allowed.
- All uploaded files must belong to the same bank account or credit card.
- If multiple different account numbers are detected, block processing and display an error.

Duplicate handling:
- Apply duplicate detection rules defined in File Processing Rules.

Accounting inputs:
- User must provide:
  - Accounting period start date and end date.
  - Opening balance.

Consolidation:
- Merge files in chronological order.
- Apply consolidation and balance calculation rules defined in Consolidation Rules.

Balance verification:
- If an input Balance column exists:
  - Compare calculated running balance with provided balance.
  - Flag all discrepancies in the consolidated file.
- If no Balance column exists:
  - Generate Balance column automatically.

Account categorisation step:
- After consolidation, prompt user to choose categorisation path:
  - Bank Path
  - Invoice Path

Ledger database usage:
- Use the internal ledger database with columns:
  No, Description, Analysis account (Invoice), Analysis account (Bank)
- Match consolidated transaction Description field against the ledger database Description field.
- Apply exact match first.
- If no exact match found, apply fuzzy match with minimum similarity threshold of 85%.
- If no match is found:
  - Leave Analysis account field blank.
  - Flag row as unmapped.

Output file generation:
- Generate two CSV output files:
  - PAY file for Money Out transactions.
  - REC file for Money In transactions.

PAY and REC rules:
- PAY file includes only transactions where Amount is negative.
- REC file includes only transactions where Amount is positive.
- Convert internal Amount field to positive values in both output files.

Column population rules:
- Type:
  - PAY for Money Out file
  - REC for Money In file
- Ref no:
  - Auto-generate sequential reference number starting from 1.
- Date:
  - Use transaction date formatted as DD-MM-YYYY.
- Primary account:
  - Use detected bank account or credit card number.
- Details:
  - Use transaction description.
- Total:
  - Use absolute transaction amount.
- VAT:
  - Leave blank.
- Analysis:
  - Leave blank.
- Analysis account:
  - Populate using selected categorisation path column from ledger database.

Storage:
- Save PAY and REC files inside the relevant Accounting Period folder.



# Admin Functions
Access control:
- Only users with admin role can access the Admin page.
- Admin page must be hidden from normal users.

User management:
- Admins can create new users by setting:
  - Username
  - Password
- Admins can promote existing users to admin role.
- Admins can deactivate users.
- Deactivated users cannot log in.

Usage monitoring:
- Admins can view credit usage per user.
- Credit usage must be displayed per user account.

File management:
- Admins can view all user Business folders and Accounting Period folders.
- Admins can delete consolidated files and output files.
- Deleted files must follow the 30-day recovery rule defined in Storage & Folder Structure.

Deletion request handling:
- Admins receive email notifications when users submit file deletion requests.
- Admins can approve or reject deletion requests from the Admin page.

Ledger database management:
- Admins can edit the ledger database used for:
  - Output file format reference
  - Analysis account mapping
- Changes apply to future processing only.

Security:
- Admins cannot view raw bank transaction content unless required for deletion or recovery actions.


# Build Order
Phase 1 — Core infrastructure:
1. Create project structure.
2. Implement authentication system:
   - User login
   - Role handling (normal user vs admin).
3. Implement base database schema:
   - Users
   - Business folders
   - Accounting period folders
   - Ledger database.
4. Implement file storage system using defined folder structure.

Phase 2 — Normal user app flow

Phase 2A — Backend pipeline (NO UI, NO AI)

5. Implement file upload API
   - Multipart upload endpoint
   - Save raw files into user_data/Business/Period/raw/
   - Store file metadata in database

6. Implement file validation and parsing (NO AI)
   - File type validation (CSV/PDF)
   - Header validation
   - Row format checks
   - Reject malformed inputs

7. Implement duplicate detection and account matching (Rule-based only)
   - Hash-based duplicate detection
   - Date + amount + reference matching
   - Deterministic account mapping rules

8. Implement missing accounting period detection
   - Compare uploaded files vs expected periods
   - Flag missing months/periods

9. Implement consolidation engine (Deterministic)
   - Merge validated transaction data
   - Produce normalized transaction table
   - Output consolidated dataset

10. Implement email generation logic (Template-based)
    - Predefined templates
    - Variable injection
    - NO AI text generation


Phase 2B — Frontend flow (UI only)

11. Build Login Page
    - Connect to existing auth system

12. Build Home Page function selector
    - Email function
    - Ledger mapping function

13. Build file upload interface
    - Drag/drop upload
    - Upload progress indicator
    - Status feedback

Phase 2C — Optional AI extension (DISABLED BY DEFAULT)

14. Add AI fallback service (isolated)
    - Only used for fuzzy merchant matching
    - Must require feature flag enable
    - Token usage must be logged
    - Hard monthly cap enforced


Phase 3 — Ledger mapping flow:
13. Implement opening balance input.
14. Implement balance calculation and discrepancy detection.
15. Implement PAY and REC file generation.
16. Implement ledger database matching logic.

Phase 4 — Folder management:
17. Build Folders Page with business name type-ahead selector.
18. Implement file download functionality.
19. Implement rerun consolidation functionality.
20. Implement user deletion request workflow.

Phase 5 — Admin functionality:
21. Build Admin Page UI.
22. Implement user creation and role promotion.
23. Implement credit usage tracking display.
24. Implement admin deletion approval workflow.
25. Implement ledger database editor.

Phase 6 — Safety and polish:
26. Implement 30-day recovery deletion system.
27. Add error handling and validation messages.
28. Add loading states and progress indicators.
29. Final testing and bug fixing.


# Acceptance Tests
1. Login Tests:
   - Normal user can log in with correct credentials.
   - Admin user can log in and see Admin Page.
   - Invalid credentials are rejected.

2. File Upload & Parsing:
   - Single PDF/CSV/Excel uploads parse correctly.
   - Duplicate files are rejected or ignored.
   - Multiple files from the same account consolidate correctly.
   - Files from different accounts do not mix.

3. Missing Period Detection:
   - Missing months are correctly identified for single account.
   - Missing months are correctly identified for multiple accounts.
   - Email is generated with correct statement type (bank or credit card).

4. Consolidation:
   - Consolidated file is sorted by date.
   - Running balances are calculated correctly.
   - Discrepancies between calculated and input balances are flagged.
   - Consolidation cannot proceed if opening balance is not provided.

5. Ledger Mapping:
   - PAY and REC files are generated for Money Out and Money In.
   - Columns match exactly: Type, Ref no, Date, Primary account, Details, Total, VAT, Analysis, Analysis account
   - Analysis account column is correctly filled from ledger database based on selected path.
   - Dates are exported in DD-MM-YYYY format.
   - Unmatched rows are flagged.
   - Ledger mapping is blocked if multiple different account numbers are detected.


6. Folder & Storage:
   - Files saved in correct Business Name → Accounting Period folder.
   - Deleted files go to “deleted” folder and recoverable within 30 days.
   - Admin can permanently delete files after 30 days.
   - All users can view all Business Name folders.
   - All users can upload files into any existing Business Name folder.
   - Only Admin users can permanently delete Business Name folders.
   - System blocks creation of exact duplicate Business Name folders.
   - System displays similar Business Name suggestions when similarity ≥ 85%.
   - User can select an existing Business folder from suggestion list.
   - System warns user before creating near-duplicate Business folders.
   - Normalisation correctly matches Ltd vs Limited variations.



7. Admin Functions:
   - Admin can create users and set passwords.
   - Admin can promote normal user to admin.
   - Admin can view credit usage per user.
   - Admin can approve or reject deletion requests.
   - Admin can edit ledger database.

8. Emails:
   - Single account emails have correct greeting, subject, and missing period list.
   - Multiple account emails include all account numbers and missing periods.
   - Statement type in email matches the uploaded file(s).

9. UI & Navigation:
   - Login page, Home page, Folders page, and Admin page are accessible according to role.
   - Users cannot access admin features if not promoted.
   - Users can download consolidated and PAY/REC files.
   - Business name input displays matching existing business names as the user types and allows selection.


10. Error Handling:
    - Invalid file formats are rejected with clear messages.
    - Missing inputs trigger prompts.
    - Ambiguous date formats are resolved according to rules.
