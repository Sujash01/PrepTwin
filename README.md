# PrepTwin

AI interview coach built with React 19, TypeScript, and Vite. PrepTwin runs simulated interviews, captures an audio + video-polish session, scores your answers, and builds a Candidate Twin of strengths and growth areas.

## Tech Stack

| Area        | Choice                                   |
| ----------- | ---------------------------------------- |
| Framework   | React 19 + Vite 8                        |
| Language    | TypeScript (strict)                      |
| Routing     | React Router v7 (`react-router-dom`)     |
| Styling     | Tailwind CSS v3 + PostCSS / Autoprefixer |
| State       | React Context (`src/hooks/useApp.tsx`)   |
| Icons       | lucide-react                             |
| Charts      | recharts                                 |
| UI helpers  | @headlessui/react, clsx, tailwind-merge  |
| Linting     | Oxlint (`npm run lint`)                  |
| Package mgr | npm                                      |

> Note: The project is configured for the Tailwind v3 workflow (classic `tailwind.config.js` + PostCSS plugin). Tailwind v4 packages are not compatible with this setup.

## Getting Started

> [!IMPORTANT]
> **Security & Secrets Hygiene**: Never commit real API keys or secrets to `.env.example` or any tracked files. Ensure `.env` is listed in `.gitignore` and use `.env.example` solely for placeholder templates.

```bash
npm install
npm run dev      # start the dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check (tsc -b) then production build into dist/
npm run lint     # Oxlint
npm run preview  # preview the production build
```

## Routes

| Path          | Page / Layout                 | Purpose                                        |
| ------------- | ----------------------------- | ---------------------------------------------- |
| `/`           | LandingPage (MainLayout)      | Marketing / entry point, starts onboarding     |
| `/setup`      | CandidateSetupPage            | Name, target role, experience, mode, resume    |
| `/interview`  | InterviewRoomPage (InterviewLayout) | Simulated interview session (chat + voice) |
| `/results`    | ResultsPage                   | Per-answer scores, category chart, summary     |
| `/twin`       | CandidateTwinPage             | Persistent Candidate Twin profile              |
| `*`           | redirect → `/`                | Fallback                                       |

Pages are lazy-loaded via `React.lazy()`; unknown routes redirect to `/`.

## Architecture

```
src/
├── components/
│   ├── layout/       Navbar, Sidebar (shell chrome)
│   ├── setup/        ResumeUploader (uses resumeService)
│   ├── interview/    ChatPanel, TranscriptPanel, VoiceControls, Waveform, ...
│   ├── results/      ScoreCard, PerformanceChart, InsightCard, ...
│   ├── twin/         SkillBar, TwinCompass, ...
│   └── ui/           Design-system primitives: Button, Card, Badge, Avatar,
│                     Input, Select, Modal, ProgressBar, Divider, StateViews, ...
├── data/            mockData.ts (datasets + category icons)
├── hooks/           useApp.tsx (global context: useApp / useCandidate /
│                     useInterview / useCandidateTwin / useToast)
├── layouts/         MainLayout, InterviewLayout
├── pages/           LandingPage, CandidateSetupPage, InterviewRoomPage,
│                     ResultsPage, CandidateTwinPage
├── services/        agentService, speechService, resumeService (mock),
│                     candidateService; api.ts is the barrel re-export
├── utils/           helpers.ts (cn — clsx + tailwind-merge)
├── App.tsx          Router + layout wiring + Toast host
└── main.tsx         Entry (BrowserRouter + AppProvider)
```

### Data flow

- Global application state lives in `src/hooks/useApp.tsx` (React Context + reducer): candidate profile, interview config, answers/evaluations, Candidate Twin, and toasts.
- "Backend" code is isolated behind `src/services/*`. Today every service is a **mock implementation** with `// TODO: Connect to backend / <provider>` markers, so all pages run fully offline. Replace the internals with real API calls (Azure OpenAI, Azure Speech, Resume Parser) without touching UI code.

## Design System

Dark-first palette defined in `tailwind.config.js`:

| Token                | Value    |
| -------------------- | -------- |
| `bg-surface-900`     | `#08090D` (page background) |
| `bg-surface-800`     | `#111318` |
| `bg-surface-700`     | `#171A21` |
| `border-surface-700` | `#262A33` |
| `bg-primary-600`     | `#7C5CFC` (brand) |
| `bg-primary-500`     | `#8B70FF` (hover) |
| `text-surface-100`   | `#F5F7FA` |
| `text-surface-400`   | `#9CA3AF` |

Reusable primitives live in `src/components/ui/` and accept consistent variants (primary/secondary/ghost, sm/md/lg, `className` passthrough).

## Current Status

- All routes are implemented end-to-end with mock data.
- `npm run build`, `npm run lint`, and the dev server all run green.
- Voice features (Web Speech / Speech Synthesis) and AI feedback are stubbed in `services/` and wired at the UI layer, ready for real backend integration.