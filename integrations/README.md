# Moonlight 2 lead capture
Existing production: anlac-green-symphony.vercel.app; same GitHub/Vercel project.
Flow: browser POST /api/leads → authenticated Apps Script doPost → private Google Sheet.
Sheet: https://docs.google.com/spreadsheets/d/18yVlQhcHajrlI19DzYl3sn51pcNaVjvvPZzElWm1np8/edit
Apps Script: https://script.google.com/home/projects/1M7PNPYsQVKrEdbf4ICyECHytHRBHC2cElvS5AwFhT6OuECdZWIHbnMBT/edit
Deploy integrations/google-sheets.gs as web app running as owner. Script property WEBHOOK_SECRET must equal Vercel production LEADS_WEBHOOK_SECRET. LEADS_WEBHOOK_URL is the /exec deployment endpoint. Do not store real secrets in source. No customer list is exposed by API or Apps Script GET.
Columns A:I: Vietnam registration time, name, phone (text), property type, request, status, consent, source, stable request ID. Do not change order without updating receiver. Status starts Mới; advisor can update it manually. Filter and frozen header enabled.
Client retries reuse request ID for unchanged data, receiver serializes writes and deduplicates ID. Request limits, exact production Origin, honeypot, per-client keyed-hash rate limit and formula escaping protect input. No automatic emails.
Run node --test tests/leads.test.cjs and node --check dist/app.js before publication. End-to-end verification must confirm a marked test row in Sheet before declaring activation complete.

Active Apps Script web app deployment: AKfycbxpO8CDvUE0FRAtXyMCZR7XXe0w3eMJvE9WtsvZbU4k_tX74XGqUA0rQCIwtN8vWgg2 (version 1). Keep this deployment ID on future receiver edits.
