# AGENTS.md — chatterly-server

## Purpose
Express + Socket.io backend. Handles REST API and real-time events.

## Key rules
1. Routes never contain business logic — only call services.
2. Socket handlers never contain business logic — only call services.
3. All socket event name strings come from `@your-github-username/chatterly-types`.
   - **TODO**: Currently defined in `src/types/socket.events.ts` - needs to be extracted to external package
4. Socket.io uses built-in in-memory adapter for pub/sub (single-server deployment).
   - For multi-server deployments, use `@socket.io/redis-adapter`
5. Validate all env vars at startup via `src/config/env.ts` (zod). App crashes if vars are missing — this is intentional.
6. Route order matters: specific routes (e.g., `/search`, `/online`) must be defined BEFORE parameterized routes (e.g., `/:userId`).

## Request lifecycle
HTTP: Request → auth.middleware → route handler → service → model → response
Socket: Event → socket.auth middleware → handler → service → model → socket.io emit → ack

## API base path
All routes: `/api/v1`
Response shape: `{ success: boolean, data?: T, error?: string, pagination?: {...} }`

## File naming
`feature.type.ts` — e.g. `auth.service.ts`, `message.handler.ts`, `room.routes.ts`