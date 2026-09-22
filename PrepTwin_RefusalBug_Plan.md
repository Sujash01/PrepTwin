# PrepTwin — Refusal-Text Bug Fix + Remaining Improvements

## What was actually wrong

**Symptom you saw:** "the interview always asks for try again everytime then work" + a raw string like *"I can't go with this request"* showing up as if it were the next interview question.

**Root cause (confirmed by reading + testing the code, not guessing):**

1. `foundryService.ts` had a guardrail-refusal detector (`isAgentRefusal`), but it only matched one exact phrasing: `"I'm sorry, but I cannot assist/help"`. Azure's content-filter/guardrail refusals come back in many other phrasings ("I can't go with this request", "I'm not able to continue with this", "I cannot fulfill this request", etc.) — none of which matched, so the refusal text sailed through undetected.
2. That refusal-retry logic only ran during **interview start**. It was never applied to **answer turns** (`sendInterviewMessage`) at all — so once the interview was underway, any refusal or malformed reply (missing the `<<<EVALUATION>>>` marker the agent is told to always include) was parsed as if it were a normal question and shown to the candidate verbatim.
3. Net effect: intermittently — a normal, expected pattern for LLM guardrails, not a hard failure — the agent would refuse a turn, the raw refusal text would render as "the next question," the user would hit retry / resend, and the retried turn would usually succeed (hence "asks to try again every time then works").

## What was fixed

In `foundryService.ts`:
- **Broadened `isAgentRefusal`** to catch the general shape of a refusal (a decline verb — can't/cannot/unable to/won't — near "help/assist/continue/comply/fulfill/proceed/answer/process" or near "this/that request"), tested against 8 sample phrasings including realistic non-refusal interview text to check for false positives (all passed).
- **Added a shared retry wrapper** (`sendFoundryTurnWithRetry`) used by **both** `startInterview` and `sendInterviewMessage`. It now:
  - Retries automatically (up to 2 extra attempts, same request) whenever a reply looks like a refusal, **or** — for answer turns specifically — is missing the required `<<<EVALUATION>>>` marker (a sign of a malformed/non-compliant reply).
  - Only after all retries are exhausted does it surface a real `InterviewServiceError('upstream', ...)`, which the frontend already turns into a proper error state with a **Retry** button (`InterviewRoomPage.tsx` already had this UI — it just never got exercised for this failure mode).
- Verified: typecheck passes, mock-mode server boots and a full start→answer interview round-trip still works exactly as before (no regression), and the new refusal detector correctly classifies both refusal and normal interview text in isolated tests.

**Net result:** the candidate should now only ever see a real interview question or a clean "please retry" error — never raw refusal text pretending to be a question. Retries that used to require a manual click now happen automatically server-side first.

`foundryService.fixed.ts` (delivered alongside this plan) is the updated file — diff it against your copy or drop it in directly.

## Other things I checked while I was in there

- ✅ Frontend error/retry UI (`InterviewRoomPage.tsx`) was already correct — it just wasn't being triggered for this bug class. No frontend change needed.
- ✅ Mock mode, chat, and the crash fix from last round all still work (regression-tested).
- ⚠️ **`server/.env` still has the same key values flagged as leaked in the first review.** If these haven't been rotated in the Azure Portal yet, do that now — this is the third time flagging it, and it's a live-credential issue independent of any code bug.
- ⚠️ `dist/` (built frontend, ~960KB) is present in your project zip. Not a functional bug, but it shouldn't be committed/shipped as source — add it to `.gitignore` if it isn't already, and rebuild via `npm run build` rather than hand-editing/shipping the built output.

## Suggested next improvements (not urgent, ordered by value)

1. **Surface partial credit on refusal-exhaustion.** Right now, if all retries fail on an answer turn, the whole turn errors out and the candidate's answer is effectively lost (they have to resend it). Consider: on final failure, still log the candidate's answer server-side (for the eventual summary) even though no evaluation could be produced, so a rare full failure doesn't silently drop what they said.
2. **Telemetry on refusal frequency.** Add a simple counter/log line (already partially there via `console.log`) that's easy to grep — you'll want to know if refusals are rare (a couple % of turns, expected) or frequent (a sign the agent's system prompt or the standing-rules framing needs adjusting, since Azure content filters can be sensitive to how "untrusted candidate content" is framed).
3. **Same treatment for the chat flow.** `sendChatMessage`/`startChat` in `foundryService.ts` don't have any refusal detection at all (they never required the `<<<EVALUATION>>>` marker, so it's lower-stakes, but a plain refusal could still show up as a chat reply). Low priority since chat is more tolerant of an odd reply, but worth the same fix if you see it happen.
4. **Follow up on the still-open Entra-auth decision** from the previous runbook (Section 2) — confirm `az login` is actually working for your real Foundry calls day-to-day, since that's a separate failure mode from the one fixed here.
