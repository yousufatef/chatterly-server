# AGENTS.md — chatterly-server

## Purpose
Express + Socket.io backend. Handles REST API and real-time events.

## Key rules
1. Routes never contain business logic — only call services.
2. Socket handlers never contain business logic — only call services.
3. All socket event name strings come from `@your-github-username/chatterly-types`.
4. Two Redis clients exist: `redisPublisher` and `redisSubscriber` — never use the subscriber to publish.
5. Validate all env vars at startup via `src/config/env.ts` (zod). App crashes if vars are missing — this is intentional.

## Request lifecycle
HTTP: Request → auth.middleware → route handler → service → model → response
Socket: Event → socket.auth middleware → handler → service → model → redis publish → ack

## API base path
All routes: `/api/v1`
Response shape: `{ success: boolean, data?: T, error?: string, pagination?: {...} }`

## File naming
`feature.type.ts` — e.g. `auth.service.ts`, `message.handler.ts`, `room.routes.ts`