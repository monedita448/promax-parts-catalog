Paste the block below into OpenCode exactly as-is.

---

Work inside this folder:
/Users/blackberrybold/Library/Application Support/Claude/local-agent-mode-sessions/5b5d1e05-1a0c-480a-9156-2f91f8b4a497/36c3b86f-221c-477c-aeac-746836f79fb9/local_9bcaba3a-812f-45db-bb50-dcaa29c60152/outputs/promax_catalog

This folder is already a git repo pushed to monedita448/promax-parts-catalog
(public). Do the following, in order:

1. Stage and commit every file that isn't already committed:
   git add -A
   git commit -m "Add debug screenshot capture for price-check failures"
   git push
   (If there's nothing to commit, that's fine — just tell me so.)

2. Trigger a fresh run so the debug capture actually fires:
   gh workflow run "Update parts prices" --repo monedita448/promax-parts-catalog
   sleep 60
   gh run list --repo monedita448/promax-parts-catalog --limit 1

3. Get the run ID from step 2's output, then download the debug
   artifact it produced (this only contains files if a price check
   failed):
   gh run download <RUN_ID> --repo monedita448/promax-parts-catalog --name price-check-debug --dir ./debug-download
   (If this errors saying the artifact doesn't exist, that's actually
   good news - it means every price was found successfully this time.
   Tell me that instead.)

4. If the download in step 3 worked, list what's inside:
   ls -la ./debug-download
   Then open the .html file in that folder and search it for any of
   these words: "cloudflare", "captcha", "just a moment", "robot",
   "access denied", "blocked", "verify you are human". Tell me which of
   those (if any) appear, plus the first 500 characters of visible text
   in the HTML file (skip script/style tags), and the full file path to
   the .png screenshot on my computer.
