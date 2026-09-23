# PrepTwin — Fix-Until-It-Works Runbook

**Audience:** an agentic coding tool (Antigravity or similar) operating directly on this repo, plus the human developer as fallback. Written so an agent can execute it mechanically: run a step, check its verification command, and only advance when the check passes. If a check fails, the agent loops on that step (retry / adjust / re-run) — it does not skip ahead.

**How to use this file:** treat every `### Step` as a state in a loop. Each step has: Action → Command(s) → Pass condition → If fail. An agent should re-read this whole file after each fix in case an earlier fix changes what's needed later.

---

## 0. Ground truth found by diagnosis (already fixed once — verify it's still applied)

Two confirmed root causes were found by actually running the server, not just reading code:

1. **FATAL — server never starts.** `server/services/resumeService.ts` does a top-level `require('pdf-parse')`. pdf-parse v2 is built on `pdfjs-dist`, which references `globalThis.DOMMatrix` unconditionally at load time. In any environment where the optional native `@napi-rs/canvas` package fails to load (missing prebuilt binary for the OS/arch — very common on Windows, sandboxes, some CI), `DOMMatrix` is never polyfilled, and Node throws `ReferenceError: DOMMatrix is not defined` **during module load, before `app.listen()` ever runs.** This crashes the *entire* Express process — not just resume upload. Every route, including `/api/chat/message`, has no server to answer it. This is why "the chatbot or anything" was not working: there was no server.
2. **Auth mismatch for real Foundry mode.** `server/README.md` documents an API-key auth path (`AZURE_AI_API_KEY` used as bearer credential), but `foundryService.ts` only ever uses `DefaultAzureCredential` (Entra ID) — the API key is deliberately ignored. If Foundry env vars are configured but no `az login` / managed identity / service principal is available, every real Foundry call fails with 401/403, and the frontend shows "PrepTwin couldn't respond right now." (mock mode is unaffected by this).

### Step 0.1 — Confirm the crash fix is applied
**Action:** Open `server/services/resumeService.ts`. Confirm there is a polyfill block (stubbing `DOMMatrix`, `ImageData`, `Path2D` on `globalThis` when undefined) placed **before** the `require('pdf-parse')` call.
**Pass condition:** the block exists above the `const { PDFParse } = require('pdf-parse')` line.
**If fail:** add it (see `resumeService.fixed.ts` delivered alongside this plan, or ask the agent to regenerate the equivalent guard).

### Step 0.2 — Prove the server actually boots
**Command:**
```bash
cd server
npm install
FOUNDRY_MOCK_MODE=true PORT=5099 npx tsx index.ts &
sleep 3
curl -s http://localhost:5099/api/health
```
**Pass condition:** returns `{"status":"ok"}`. No `ReferenceError` in the terminal output.
**If fail:** read the actual stack trace (not just the first warning line) — `tail -c 4000` on the captured log tends to show the real `Error:`/`ReferenceError:` under a wall of noise. Fix the specific error, re-run this step. Do not proceed to Step 1 until this passes.

### Step 0.3 — Prove chat actually responds (mock mode)
**Command:**
```bash
curl -s -X POST http://localhost:5099/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I prepare for behavioral questions?"}'
```
**Pass condition:** JSON with `"success":true` and a non-empty `"reply"`.
**If fail:** re-check Step 0.2 (server may not actually be listening), then check `server/routes/chat.ts` and `server/services/foundryService.ts` mock path for regressions.

---

## 1. Security — rotate leaked keys (independent of the above; do this regardless)

### Step 1.1
**Action:** In the Azure Portal, rotate `AZURE_AI_API_KEY` and `AZURE_SPEECH_KEY` — the values that were in `server/.env.example` were live, shareable secrets, not placeholders.
**Pass condition:** old key values return 401 when tested; new values are only in `server/.env` (gitignored), never in `.env.example`.
**If fail:** repeat until both are rotated. This step has no code dependency — do it in parallel with everything else.

### Step 1.2
**Command:** `grep -R "<old key substring>" . --exclude-dir=node_modules` (repo root)
**Pass condition:** no matches, including inside `dist/`.
**If fail:** find and scrub the match, re-run.

---

## 2. Get real Foundry mode actually answering (not just mock mode)

### Step 2.1 — Decide the auth path
Two options; pick one and note the choice in `server/README.md` so it doesn't drift again:

- **Option A — Entra ID (matches current code):** install Azure CLI, run `az login` on the machine running the server (or attach a managed identity / service principal via standard `DefaultAzureCredential` env vars: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`). No code change needed.
- **Option B — restore API-key auth in code:** if Entra/`az login` isn't viable (e.g., CI, containers without identity), modify `foundryService.ts`'s `createProjectClient()` to use `AZURE_AI_API_KEY` as a bearer credential when present, matching what `server/README.md` already documents. This is a real code change — test it against a live Foundry call before trusting it.

**Pass condition for this step:** a decision is made and `server/README.md`'s "Auth notes" section matches what the code actually does (it currently does not — the README claims key-or-Entra, the code is Entra-only).

### Step 2.2 — Verify real mode reachability
**Command:**
```bash
cd server
PORT=5098 npx tsx index.ts &
sleep 3
curl -s http://localhost:5098/api/ai/status
```
**Pass condition:** JSON shows `"provider":"foundry"`, `"configured":true`, and — after Step 2.1 is done correctly — a live call in Step 2.3 succeeds (status alone only proves configuration, not reachability).
**If fail:** re-check Step 2.1; `auth` field must reflect how the code actually authenticates.

### Step 2.3 — Prove a real agent call round-trips
**Command:**
```bash
curl -s -X POST http://localhost:5098/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Say hello."}'
```
**Pass condition:** `"success":true`, `"mode":"foundry"`, non-empty `"reply"`.
**If fail:** read the server log line starting `[Foundry] operation=... status=...`. Status 401/403 → auth (back to Step 2.1). Status 404 → agent name/endpoint mismatch — check `AZURE_AI_AGENT_ID` matches the deployed agent exactly. Any other status → read `sanitizeFoundryMessage`'s scrubbed error text in the log for the real cause, fix, retry this step.

---

## 3. Frontend actually talking to this backend (not silently mocking)

### Step 3.1
**Command:**
```bash
cd .. # repo root (preptwin/)
cat .env.example
```
**Pass condition:** `VITE_API_BASE_URL=http://localhost:5000` (or whatever port the server actually runs on) exists in the frontend's own `.env` (copy from `.env.example` if missing).
**If fail:** create `.env` from `.env.example`, adjust the port to match wherever the server is actually listening.

### Step 3.2 — End-to-end browser check
**Action:** with the server running (Step 0.2/2.2) and `npm run dev` running for the frontend, open `/chat` in the browser, send a message.
**Pass condition:** a reply appears in the UI within the 45s client timeout (`chatApi.ts`'s `postJson` default).
**If fail:**
- Network tab shows no request at all → check `VITE_API_BASE_URL` (Step 3.1) and that `npm run dev` was restarted after `.env` changed (Vite only reads env at startup).
- Network tab shows a CORS error → check `CORS_ORIGINS` in `server/.env` includes the dev server's actual origin, or that it falls inside the loopback dev range regex in `index.ts` (`localhost:5170-5180`).
- Request succeeds but UI shows the generic error bubble → check the response body's `message` field directly with curl (bypass the UI) to see the real error, then follow Section 2's loop.

---

## 4. Full regression loop (run this whole block after any change, repeat until every check passes in one pass)

```bash
# 1. Backend boots clean
cd server && FOUNDRY_MOCK_MODE=true PORT=5099 npx tsx index.ts &
sleep 3 && curl -sf http://localhost:5099/api/health || echo "FAIL: health"

# 2. Mock chat works
curl -sf -X POST http://localhost:5099/api/chat/message -H "Content-Type: application/json" \
  -d '{"message":"test"}' | grep -q '"success":true' || echo "FAIL: mock chat"

# 3. Mock interview works end-to-end
SID=$(curl -s -X POST http://localhost:5099/api/interview/start -H "Content-Type: application/json" \
  -d '{"name":"Test","role":"Dev","experience":"1 year","skills":["JS"],"focus":"technical"}' | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
curl -sf -X POST http://localhost:5099/api/interview/message -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SID\",\"message\":\"I would use REST with proper status codes.\"}" \
  | grep -q '"success":true' || echo "FAIL: mock interview"

# 4. Real Foundry mode boots clean and responds (only if Step 2.1 auth is set up)
PORT=5098 npx tsx index.ts &
sleep 3 && curl -sf http://localhost:5098/api/ai/status | grep -q '"provider":"foundry"' || echo "FAIL: foundry status"
curl -sf -X POST http://localhost:5098/api/chat/message -H "Content-Type: application/json" \
  -d '{"message":"test"}' | grep -q '"mode":"foundry"' || echo "FAIL: real foundry call"

# 5. Typecheck stays clean
npm run typecheck || echo "FAIL: typecheck"
```

**Loop rule:** if any line prints a `FAIL:`, stop, diagnose that specific failure using the matching section above, fix it, then **re-run this entire block from the top** (not just the failing line) — a fix for one symptom can reintroduce another. Only declare PrepTwin "working" when a full pass produces zero `FAIL:` lines.

---

## 5. After everything passes

- Re-read `server/README.md` and fix any remaining line that no longer matches the code (the auth-notes mismatch found in Section 2 is the known one; check for others while you're in there).
- Delete the temporary background server processes (`kill %1 %2` or equivalent) before handing back a clean terminal.
- Move on to the feature work in `PrepTwin_Plan.md` (the earlier phased plan) — that document assumed the app already worked end-to-end, which was false until this runbook's Section 0 was applied.
