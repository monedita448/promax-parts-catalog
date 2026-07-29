Paste the block below into OpenCode exactly as-is.

---

Work inside this folder:
/Users/blackberrybold/Library/Application Support/Claude/local-agent-mode-sessions/5b5d1e05-1a0c-480a-9156-2f91f8b4a497/36c3b86f-221c-477c-aeac-746836f79fb9/local_9bcaba3a-812f-45db-bb50-dcaa29c60152/outputs/promax_catalog

This folder is already a git repo pushed to monedita448/promax-parts-catalog
(private). Do the following, in order:

1. Stage and commit every file that isn't already committed:
   git add -A
   git commit -m "Add auto price/stock-check workflow and failure banner"
   git push
   (If there's nothing to commit, that's fine — skip straight to step 2.)

2. Set the two GitHub Actions secrets the price-check workflow needs.
   Use the gh CLI, prompting me interactively for each value rather
   than asking me to type them in chat — run:
   gh secret set IG_EMAIL --repo monedita448/promax-parts-catalog
   gh secret set IG_PASSWORD --repo monedita448/promax-parts-catalog
   Each command prompts for the value at a terminal prompt (hidden
   input) — enter my Injured Gadgets email and password there, not in
   this chat. Skip this step if the secrets are already set.

3. Trigger one test run so we know it works before waiting two days:
   gh workflow run "Update parts prices" --repo monedita448/promax-parts-catalog
   Wait about 30 seconds, then check the result:
   gh run list --repo monedita448/promax-parts-catalog --limit 1
   Tell me whether it succeeded or failed. If it failed, show me the
   log: gh run view --repo monedita448/promax-parts-catalog --log

Do not print my email or password back to me in chat — only confirm
that the secrets were set. Do not make the repository public.
