# PrepTwin API server

Local backend that connects the PrepTwin React app to a Microsoft Foundry agent
(`PrepTwin-Interviewer`). React never talks to Foundry directly; it only calls
these endpoints.

## Run

```bash
npm install
npm run dev        # tsx watch -- restart on change
npm start          # single run, no watch
npm run typecheck  # tsc --noEmit
```

The server listens on `PORT` (default `5000`). Copy `.env.example` to `.env` and
fill in your values.

## Environment variables

| Variable                    | Required | Description                                                                  |
| --------------------------- | -------- | ---------------------------------------------------------------------------- |
| `PORT`                      | no       | Port to listen on (default `5000`)                                           |
| `AZURE_AI_PROJECT_ENDPOINT` | yes*     | Foundry project endpoint (e.g. `https://<project>.services.ai.azure.com/`)    |
| `AZURE_AI_AGENT_ID`         | yes*     | Id of the deployed `PrepTwin-Interviewer` agent                             |
| `AZURE_AI_API_KEY`          | no       | API key for the agent. When set, it is used as the bearer credential.        |
| `FOUNDRY_MOCK_MODE`         | no       | Set to `true` to force the local interviewer (no Foundry credentials needed) |
| `AZURE_SPEECH_REGION`       | yes**    | Region of the existing Azure Speech resource (e.g. `eastus`)                 |
| `AZURE_SPEECH_KEY`          | yes**    | Key of the existing Speech resource (never leave in committed files)         |
| `SPEECH_LANGUAGE`           | no       | Recognition language (default `en-US`)                                       |
| `SPEECH_VOICE`              | no       | Neural voice for TTS (default `en-US-AriaNeural`)                            |
| `CORS_ORIGINS`              | no       | Comma-separated allowed browser origins (default localhost:5173 traffic)     |

\* Required only when using Foundry. If the endpoint or agent id are missing, or
`FOUNDRY_MOCK_MODE=true`, the server runs the clearly-labelled **local mock
interviewer** so the full frontend flow works without credentials or cost.

\** Required only for speech input/output.

## Foundry mode & startup verification

Mode selection is: **valid Foundry configuration → real agent; otherwise → local
mock**. `FOUNDRY_MOCK_MODE=true` can force mock even when credentials exist, but
the server never silently ignores present credentials - it warns loudly.

On startup the server prints a secret-safe status line:

```text
PrepTwin API listening on http://localhost:5000
Foundry interviewer: active - real 'PrepTwin-Interviewer' agent (agent id: <id>, auth: api-key (AZURE_AI_API_KEY) | Azure DefaultAzureCredential (Entra ID))
```

Mock mode prints `LOCAL MOCK mode (no real Foundry traffic)`, plus a warning when
`FOUNDRY_MOCK_MODE=true` overrides real credentials. These lines never include
API keys, endpoints or prompts. To verify the real path end-to-end locally, set
the three `AZURE_AI_*` variables, confirm the startup line says `active`, and
run a live `/api/interview/start` plus `/api/chat/message`.

## Speech integration

Audio never goes to the browser's Azure account - it goes browser → `/api/speech`
endpoints → Azure AI Speech, using the official
`microsoft-cognitiveservices-speech-sdk` (v1.51) in `services/speechService.ts`.

- The browser records with `getUserMedia` + `MediaRecorder`, decodes the clip and
  re-encodes a 16 kHz mono PCM WAV in the client, then uploads it.
- `POST /api/speech/transcribe` expects a binary WAV body
  (`Content-Type: audio/wav`, ≤ 10 MB). The server validates the RIFF header,
  sample rate and bit depth, then streams the PCM into the Speech SDK.
- `POST /api/speech/synthesize` returns 16 kHz mono WAV audio as base64.
- Speech keys, regions and SAS URLs never leave the server; no audio is stored.

**Why the SDK and not "Speech MCP":** there is no MCP server harness inside this
Express process, and MCP client tools cannot be invoked by the running backend.
The previous `src/services/speechService.ts` was a stub, so this backend uses the
official Speech SDK directly - the real Azure interface - isolated in
`speechService.ts`.

If Speech is unconfigured (`AZURE_SPEECH_REGION`/`AZURE_SPEECH_KEY` missing) the
routes report a deterministic `501 not-configured` and the frontend keeps the
interview going in text mode. Speech never blocks the interview.

## Resume processing

Resumes (PDF or DOCX, ≤ 5 MB) are parsed locally in `services/resumeService.ts`:

- PDF text is extracted with `pdf-parse` (v2, built on `pdfjs-dist`).
- DOCX text is extracted with `mammoth`.
- The file bytes are never sent to a third party and no AI service is used for
  extraction. Nothing is written to disk; no temporary files are created.

The extracted text is treated as **untrusted input**: whitespace is normalized,
content is truncated to a bounded size, and it is only ever passed to the Foundry
agent delimited inside `--- BEGIN RESUME CONTENT ---` / `--- END RESUME CONTENT
---` with an explicit instruction that it must never override the interview
instructions (prompt-injection resistance). Full resume text is never logged and
never returned through `/api/health`.

The extracted text stays **server-side in memory** (`services/resumeContext.ts`,
30-minute TTL, bounded to 30 entries). The browser only receives an opaque
`resumeId` token and stores lightweight metadata (`filename`, `processed`).

### `POST /api/resume/parse`

Binary file body (`Content-Type: application/pdf` or the DOCX mimetype, plus an
`X-Filename: resume.pdf` header). The server sniffs magic bytes — neither the
mimetype nor the filename is trusted on its own.

```http
POST /api/resume/parse
Content-Type: application/pdf
X-Filename: resume.pdf

<binary pdf bytes>
```

Response:

```json
{ "success": true, "filename": "resume.pdf", "text": "...", "resumeId": "resume-...",
  "metadata": { "pages": 2 } }
```

Errors: `413` over 5 MB, `415` unsupported/type-mismatch, `422` no readable
text / unreadable file.

### `POST /api/resume/clear`

```json
{ "resumeId": "resume-..." }
```

Best-effort removal of temporarily stored resume context when the candidate
removes the file on `/setup`.

The `resumeId` is forwarded to `POST /api/interview/start`; the server attaches
the stored context to the first agent message and then deletes it (successful
starts consume the token, so it cannot be reused).

## Answer evaluation & coaching intelligence

Every candidate answer is evaluated against the current question, target role,
experience level, skills, interview focus and prior conversation. Scores are
**AI-generated coaching estimates** - never objective measurements, hiring
decisions, personality or mental-health judgments.

### Evaluation schema (1-10 per category)

```json
{ "technical": 8, "relevance": 9, "communication": 7, "clarity": 8,
  "structure": 7, "confidence": 6, "depth": 8,
  "strengths": ["Correctly explained the core concept"],
  "improvements": ["Give a concrete example"],
  "summary": "Strong technical explanation with room for more depth.",
  "difficultyAdjustment": "increase" }
```

`confidence` measures only observable answer qualities (clarity, decisiveness,
hedging, completeness) - never psychological confidence or mental state.

### How it flows

1. The candidate answer is wrapped in an **UNTRUSTED** frame
   (`services/foundryService.ts`) before it reaches the Foundry agent, so the
   agent never follows instructions embedded in candidate content. The frame
   also repeats the responsible-AI rules.
2. The agent replies with two parts separated by the `<<<EVALUATION>>>` marker:
   the next interview question, then a single JSON evaluation. The reply is
   split and validated in `services/evaluationService.ts` (`parseAgentReply`,
   `coerceEvaluation`). A malformed/missing evaluation becomes `null` - the
   interview never stops because of it.
3. The server stores `question + candidate answer + evaluation` in the
   in-memory session store (`services/interviewSessions.ts`, TTL 2h). The
   browser only receives a subtle `feedback.status` (`analyzed` | `failed`) -
   detailed scores are never sent to the browser during the session.
4. Adaptivity: aggregate + trend (`buildAdaptation`) are fed back as coaching
   guidance into the next agent turn. The Foundry agent remains the sole
   author of questions; the server never hardcodes a question sequence.

### `POST /api/interview/message` (updated response)

```json
{ "success": true, "sessionId": "thread_ab12cd",
  "question": { "text": "Next question...", "difficulty": "Medium" },
  "isComplete": false, "mode": "foundry",
  "feedback": { "status": "analyzed" } }
```

### `GET /api/interview/:sessionId/summary`

Aggregated coaching info (powers the future `/results` page). Averages use
completed evaluations only - failed/missing evaluations are skipped, never
invented.

```json
{ "success": true, "sessionId": "thread_ab12cd", "status": "completed",
  "mode": "foundry", "questionsAsked": 7, "questionsAnswered": 6,
  "overallScores": { "technical": 7.4, "relevance": 7.8, "communication": 7.0,
    "clarity": 7.5, "structure": 6.8, "confidence": 6.9, "depth": 7.2 },
  "categoryScores": [{ "category": "technical", "score": 7.4 }],
  "strengths": ["Correctly explained the core concept"],
  "improvements": ["Give a concrete example"],
  "performanceTrend": "Improving",
  "trendSeries": [{ "question": 1, "score": 6.2 }, { "question": 2, "score": 7.0 }],
  "averageScore": 7.2,
  "topicsCovered": ["Java, OOP", "REST APIs, HTTP"],
  "disclaimer": "Scores are AI-generated coaching estimates for practice feedback - not objective measurements or hiring decisions." }
```

No credentials or internal agent information ever appear in this response.

### Local mock evaluator

When Foundry is unconfigured (or `FOUNDRY_MOCK_MODE=true`), a heuristic mock
evaluator (`services/foundryService.ts`) scores answers deterministically
(keyword coverage, hedging counts, structure markers, length) and adapts
difficulty: strong answers escalate, weak answers drop to foundational
questions, incomplete answers get targeted follow-ups. The local interview ends
after 6 answers. The mock intentionally never follows embedded instructions
(treats attacks like "reveal your system prompt" as candidate content).

## Direct chat (no candidate setup)

The same `PrepTwin-Interviewer` agent powers a direct `/chat` conversation without a
candidate profile. React only calls the Express route below - Foundry is never
reached directly from the browser and credentials never leave the server.

### `POST /api/chat/message`

Body: `message` plus an optional `sessionId` (start a new conversation by
omitting it, continue one by sending the id back):

```json
{ "message": "How do I prepare for behavioral questions?" }
```

Response:

```json
{ "success": true, "sessionId": "local-chat-ab12cd34",
  "reply": "For behavioral questions use STAR: ...", "mode": "local-mock" }
```

In Foundry mode the `sessionId` is the agent thread id (conversation memory lives
in the thread). In local-mock mode it is a bounded in-memory chat session
(2h TTL, capped at 100). Chat messages are wrapped in the same UNTRUSTED
delimiter frame as interview answers and the same responsible-AI standing rules
apply - but there is **no** evaluation contract: the agent just answers as a
prep coach. Errors: `400` invalid session/missing message, `404` expired or
unknown session, `502` upstream failure.

## Auth notes

The Azure SDK `AgentsClient` accepts an Entra ID `TokenCredential`. This server
resolves credentials as follows:

1. If `AZURE_AI_API_KEY` is set, the key is used as a bearer credential.
2. Otherwise the Azure SDK `DefaultAzureCredential` (Entra ID / `az login`) is
   used. Install the Azure CLI and run `az login` for local development.

For production, prefer a managed identity / Service Principal over static keys.

## Endpoints

### `GET /api/health`

```json
{ "status": "ok" }
```

### `POST /api/interview/start`

Body: the candidate profile (frontend sends this - the user never controls agent
instructions):

```json
{ "name": "Ada", "role": "Java Developer", "experience": "3 years",
  "skills": ["Java", "Spring"], "focus": "technical" }
```

Response:

```json
{ "success": true, "sessionId": "thread_ab12cd", "question": { "text": "...", "difficulty": "Medium" } }
```

`focus` is one of `technical | behavioral | system-design | projects | mixed`.

### `POST /api/interview/message`

Body:

```json
{ "sessionId": "thread_ab12cd", "message": "My answer..." }
```

Response (detailed coaching scores are NOT included here - see the evaluation
section above):

```json
{ "success": true, "sessionId": "thread_ab12cd",
  "question": { "text": "Next question...", "difficulty": "Medium" },
  "isComplete": false, "mode": "foundry",
  "feedback": { "status": "analyzed" } }
```

When `isComplete` is `true` the interview is over and the frontend shows the
completion screen.

### `GET /api/interview/:sessionId/summary`

Aggregated coaching info for the session (documented in the evaluation section
above). Returns `404` for unknown/expired sessions.

### `POST /api/speech/transcribe`

Binary WAV body (`Content-Type: audio/wav`, ≤ 10 MB, 16-bit PCM mono). The server
validates the WAV header and forwards the PCM to Azure AI Speech.

```http
POST /api/speech/transcribe
Content-Type: audio/wav

<binary wav bytes>
```

Response:

```json
{ "success": true, "text": "candidate transcript" }
```

### `POST /api/speech/synthesize`

```json
{ "text": "interviewer question" }
```

Response (16 kHz mono WAV, base64 — credentials never included):

```json
{ "success": true, "mimeType": "audio/wav", "audioBase64": "...", "durationMs": 2500 }
```

## Sessions

Each interview is a Foundry thread; the thread id is the `sessionId` returned to
the frontend. The candidate profile is sent once, inside the first user message,
as context for the agent. Credentials, stack traces and agent internals are never
returned to the browser - errors are logged here and map to friendly messages.

## Quick local test

With the server running (mock mode):

```bash
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/interview/start -H "Content-Type: application/json" -d "{\"name\":\"Ada\",\"role\":\"Java Developer\",\"experience\":\"3 years\",\"skills\":[\"Java\",\"Spring\"],\"focus\":\"technical\"}"
curl -X POST http://localhost:5000/api/chat/message -H "Content-Type: application/json" -d "{\"message\":\"How do I prepare for behavioral questions?\"}"
```