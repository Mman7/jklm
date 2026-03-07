# JKLM

Realtime multiplayer trivia game built with Next.js, Ably, and Redis.

Players can host a room, join with a code, answer timed questions, and race for points. Gameplay state is synchronized in realtime through Ably channels, while room state and scores are persisted in Redis.

## Showcase
<img width="1920" height="965" alt="showcase_1" src="https://github.com/user-attachments/assets/4762ab97-b9be-431d-8b70-c5cd9fafa302" />
<img width="1920" height="965" alt="showcase_2" src="https://github.com/user-attachments/assets/34b72eb5-d289-4c6b-b849-2a48e7b6fe8a" />


## Features

- Host and join room flow with shareable room code
- Realtime chat, events, and presence updates using Ably
- Timed question rounds with score tracking
- Room settings for target score and question duration
- Server-side answer validation with Netlify Edge + API fallback
- Static question dataset under `public/data/popsauces`

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 + DaisyUI
- Ably (realtime channels, presence, token auth)
- Redis (room metadata, question lists, scores, TTL cleanup)
- Netlify Edge Function for fast answer-check path

## Requirements

- Node.js 20+
- npm 10+
- Ably API key
- Redis database password (for the configured Redis host in server code)

## Environment variables

Create a `.env` file in the project root:

```bash
ABLY_API_KEY=your_ably_api_key
DATABASE_PASSWORD=your_redis_password

# Optional (used by question file fetch helpers)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Notes:

- `ABLY_API_KEY` is used server-side for token issuance and room event publishing.
- `DATABASE_PASSWORD` is used by Redis client initialization in `src/library/server/database.ts`.
- In Netlify deployments, `URL` is provided automatically and used as base URL fallback.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`: Start dev server
- `npm run build`: Build production app (runs `prebuild` first)
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run prebuild`: Generate `public/data/questions_paths.json` from dataset files

## How data and realtime work

1. Host creates room via `POST /api/room`.
2. Room state is stored in Redis hashes (meta, questions, scores) with TTL.
3. Client initializes Ably channel `room-{roomId}` using token auth from `POST /api/ably-token`.
4. Players submit answers from `PlayerInput`.
5. Answer check tries edge endpoint first in production:
   - `/edge/answer-validation` (Netlify edge function)
   - fallback `/api/answer-validation`
6. Correct answers update score in Redis and broadcast events via Ably.

## API overview

- `POST /api/room`: Create room
- `GET /api/room/[id]`: Get room by id
- `PATCH /api/room/[id]`: Update room settings (host only)
- `DELETE /api/room/[id]`: Delete room
- `GET /api/room/all`: List rooms
- `POST /api/ably-token`: Create Ably token request
- `POST /api/events`: Trigger server events (new question)
- `POST /api/answer-validation`: Validate answer and update score
- `POST /api/question/batch`: Resolve question payloads from hashes
- `GET /api/question/[id]/answer`: Get answer for a question hash

## Netlify edge function

`netlify/edge-functions/answer-validation.ts` is mapped in `netlify.toml`:

```toml
[[edge_functions]]
function = "answer-validation"
path = "/edge/answer-validation"
```

This allows fast answer checks at the edge with fallback to the API route when needed.

## Project structure (high-level)

```text
src/
	app/                 # Pages and API routes (App Router)
	components/          # UI and game components
	hooks/               # Game and sync hooks
	library/client/      # Client-side Ably/API helpers
	library/server/      # Server-side Ably/Redis/validation logic
	zustands/            # Zustand stores
public/data/           # Question + answer datasets
netlify/edge-functions/# Netlify edge handlers
```

## Troubleshooting

- Missing question index file:
  If you see an error about `questions_paths.json`, run `npm run prebuild`.
- Ably auth failures:
  Verify `ABLY_API_KEY` is set and valid.
- Redis connection failures:
  Verify `DATABASE_PASSWORD` and network access to the Redis host.

## License

No license file is currently defined in this repository.
