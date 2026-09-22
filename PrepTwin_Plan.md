# PrepTwin — Development Plan

**Purpose of this doc:** a single source of truth you can hand to an agentic coding tool (Antigravity) or work through yourself, phase by phase. Each phase has a goal, concrete tasks, files touched, and a "done when" check so an agent (or you) can self-verify before moving on.

---

## 0. Current State (as of this analysis)

- **Frontend**: React 19 + TS + Vite, Tailwind v3, React Router v7. Routes: `/`, `/setup`, `/interview`, `/results`, `/twin`.
- **Backend**: Express/TS in `server/`, proxies to an Azure AI Foundry agent (`PrepTwin-Interviewer`), with a local mock interviewer/evaluator fallback.
- **Speech**: Azure Speech SDK server-side (`/api/speech/transcribe`, `/api/speech/synthesize`).
- **Resume parsing**: local, server-side, PDF/DOCX, in-memory TTL store.
- **Evaluation**: Foundry agent returns question + `<<<EVALUATION>>>` + JSON; parsed/validated server-side, never raw to client mid-session.
- **Known good practices already in place**: prompt-injection wrapping of candidate input, responsible-AI framing on scores, adaptive difficulty, graceful degrade to mock mode.

### Known issues to fix immediately
- `server/.env.example` contains **real, live-looking Azure keys** instead of placeholders. Rotate the keys in Azure Portal and scrub the example file (Phase 1).

---

## Phase 1 — Security & Hygiene (do this first, before anything else)

**Goal:** no live secrets anywhere that could be committed or shared.

Tasks:
1. Rotate `AZURE_AI_API_KEY` and `AZURE_SPEECH_KEY` in the Azure Portal (old values are burned — treat them as compromised since they were in a shareable zip).
2. Replace real values in `server/.env.example` with obvious placeholders (`<your-agent-api-key>`, etc.).
3. Confirm `server/.env` and any `.env*` except `.env.example` are in `.gitignore` (root and `server/`).
4. Add a pre-commit check or a `README` warning that `.env.example` must never contain real values.
5. Grep the whole repo (including `dist/`) for the leaked key substring to make sure it isn't baked into any built JS bundle.

**Done when:** new keys are live in Azure, old keys are revoked, `.env.example` has no real secrets, and a repo-wide grep for the old key string returns nothing.

---

## Phase 2 — Wire Frontend to Real Backend

**Goal:** replace the frontend's mock `services/*` with real calls to the Express API, without breaking the offline/demo mode.

Tasks:
1. Audit `src/services/agentService.ts`, `interviewApi.ts`, `resumeApi.ts`, `speechApi.ts`, `chatApi.ts` for `// TODO: Connect to backend` markers.
2. Point each at the real endpoints via `VITE_API_BASE_URL` (already defined in `.env.example`):
   - `POST /api/interview/start`
   - `POST /api/interview/message`
   - `GET /api/interview/:sessionId/summary`
   - `POST /api/resume/parse`, `POST /api/resume/clear`
   - `POST /api/speech/transcribe`, `POST /api/speech/synthesize`
   - `POST /api/chat/message`
3. Keep a `VITE_USE_MOCK` (or similar) flag so the UI can still run fully offline for demos/screenshots.
4. Update `useApp.tsx` reducer/context so real API responses map cleanly onto existing state shape (`utils/types.ts`) — reconcile any drift between mock data shape and real API response shape.
5. Handle the three real-world states everywhere a call happens: loading, error (503/502/network), and empty/`404` (expired session).

**Done when:** a full interview (setup → interview → results) runs end-to-end against the real Express server in Foundry mode, with mock mode still available as a toggle.

---

## Phase 3 — Interview Room UX (voice + text)

**Goal:** make `InterviewRoomPage` feel real, not a placeholder.

Tasks:
1. `ResponseRecorder.tsx` — wire `getUserMedia` + `MediaRecorder` → client-side WAV re-encode (16kHz mono) → `POST /api/speech/transcribe`. Show waveform (`Waveform.tsx`) while recording.
2. `ttsPlayer.ts` — play back synthesized interviewer questions from `/api/speech/synthesize` (base64 WAV → `Audio`/`AudioContext`).
3. Text-mode fallback: if Speech is `501 not-configured`, silently keep the interview in text mode (per server README) — surface a small, non-alarming UI indicator, not an error toast.
4. `AdaptiveIndicator.tsx` / `MicroFeedback.tsx` — surface the *subtle* signal only (`feedback.status: analyzed|failed`), never leak scores mid-interview (matches server design intentionally hiding detailed scores until `/results`).
5. `ExitInterviewModal.tsx` — confirm early exit still calls summary endpoint so partial sessions produce partial results rather than being silently discarded.

**Done when:** a candidate can complete a full voice interview (mic → transcript → next question spoken back) or a full text interview, with graceful fallback between the two.

---

## Phase 4 — Results & Candidate Twin

**Goal:** turn `/results` and `/twin` from mock data into real, persuasive output.

Tasks:
1. `ResultsPage.tsx` + `PerformanceChart.tsx` — consume `GET /api/interview/:sessionId/summary` (`overallScores`, `categoryScores`, `trendSeries`, `strengths`, `improvements`, `disclaimer`).
2. Always render the `disclaimer` string from the API verbatim ("AI-generated coaching estimates... not objective measurements or hiring decisions") — don't drop it in the UI.
3. `StrengthWeaknessList.tsx` — map `strengths[]` / `improvements[]` directly; don't invent copy client-side.
4. `CandidateTwinPage.tsx` + `SkillMap.tsx` — decide persistence: is the Twin session-only (derived from the latest summary) or does it persist across multiple interviews? If the latter, this needs a real store (Phase 6) since `interviewSessions.ts` is in-memory/TTL only.
5. Empty/first-run state: new candidate with no completed interview yet — `StateViews.tsx` should handle this without a broken chart.

**Done when:** results and twin pages reflect real session data, degrade cleanly with 0 or partial data, and always show the responsible-AI disclaimer.

---

## Phase 5 — Resume Upload Flow

**Goal:** finish `CandidateSetupPage` → resume → interview context handoff.

Tasks:
1. `ResumeUpload.tsx` — real upload to `POST /api/resume/parse` with `X-Filename` header and content-type sniffing already implemented server-side; handle `413`/`415`/`422` with specific user-facing messages (too big / wrong type / unreadable).
2. Store only the opaque `resumeId` client-side (never raw resume text) — confirm this in `useApp.tsx`/`candidateService.ts`.
3. Forward `resumeId` into `POST /api/interview/start`; confirm server consumes/deletes it on successful start (per README) and the client clears its local reference too.
4. `POST /api/resume/clear` on candidate removing the file pre-interview.

**Done when:** uploading a resume, starting an interview, and removing a resume before starting all behave correctly and match the "resume text never re-exposed to browser" guarantee.

---

## Phase 6 — Persistence (beyond in-memory TTL)

**Goal:** decide if PrepTwin needs real persistence, and if so, add it deliberately (currently sessions/resumes/chat are all in-memory with TTLs — fine for a demo, not for real users returning later).

Tasks:
1. Decide scope: anonymous/session-only tool vs. accounts with history.
2. If accounts: pick auth (e.g. simple email/passwordless, or Azure AD B2C to match the rest of the Azure stack) and a datastore (Azure Table/Cosmos DB/Postgres) for: candidate profile, interview history, aggregated Twin data over time.
3. If session-only: explicitly document that as the product decision so Phase 4's Twin persistence question is settled, and skip the rest of this phase.

**Done when:** either persistence is implemented and interview history survives a server restart, or the "no persistence" decision is documented in the README as intentional.

---

## Phase 7 — Hardening & Deploy

**Goal:** make it deployable somewhere real.

Tasks:
1. `CORS_ORIGINS` — confirm production origin(s) are set, not just localhost.
2. Rate limiting on `/api/speech/*` and `/api/interview/*` (cost + abuse control, since these hit paid Azure services).
3. Structured server logging (already "secret-safe" per README — extend that discipline to all error paths).
4. Health check (`/api/health`) wired into whatever host you pick (Azure App Service / Container Apps fit naturally next to Foundry + Speech).
5. Build pipeline: `npm run build` (frontend) + server build/start script; decide single combined deploy vs. separate frontend (static hosting) + backend (App Service).
6. Basic smoke tests: `/api/health`, mock-mode `/api/interview/start` → `/api/interview/message` → summary, run in CI on every push.

**Done when:** the app runs behind real URLs (not localhost), with rate limits and monitoring, and a CI smoke test catches a broken deploy before users see it.

---

## Suggested order of attack

1. Phase 1 (security) — non-negotiable, do today.
2. Phase 2 (real backend wiring) — unlocks everything else being testable end-to-end.
3. Phase 5 (resume) and Phase 3 (voice UX) can run in parallel — both depend only on Phase 2.
4. Phase 4 (results/twin) depends on Phase 2 + a decision from Phase 6 (does Twin persist?).
5. Phase 6 (persistence) — make the decision early even if you implement it late.
6. Phase 7 (deploy) — last, once the product loop actually works.

---

## Open product decisions (answer these before Phase 4/6 in earnest)

- Does the Candidate Twin persist across multiple interview sessions, or reset each time?
- Is this single-user/local, or multi-candidate with accounts?
- Target deploy target — Azure App Service, Container Apps, or something else?
- Any plan to swap the GPT-4 Foundry agent for a newer model, or is the agent config out of scope for this plan?
