# Chatterly Server - AGENTS.md Compliance Checklist

## ✅ Architecture Compliance

### 1. Separation of Concerns (Routes vs Services)
- ✅ **Routes**: Only receive requests, call services, send responses
  - All routes in `/routes` folder follow pattern: route handler → service call → response
  - No business logic in routes
  - Examples:
    - `auth.routes.ts`: register/login → AuthService
    - `message.routes.ts`: createMessage → MessageService
    - `room.routes.ts`: createRoom → RoomService

- ✅ **Services**: All business logic lives here
  - Files: `auth.service.ts`, `message.service.ts`, `room.service.ts`, `user.service.ts`, `upload.service.ts`
  - Services validate inputs, interact with models, publish Redis events
  - Examples:
    - Validation (user exists, room member check)
    - Authorization checks (ownership, permissions)
    - Data transformation (formatting responses)
    - Redis publish for notifications

### 2. Socket Handlers Architecture
- ✅ **Socket Handlers**: Only call services, no business logic
  - Files: `message.handler.ts`, `room.handler.ts`, `presence.handler.ts`, `typing.handler.ts`
  - All handlers follow pattern: socket event → service call → emit event
  - No logic, only orchestration
  - Examples:
    - `message.handler.ts`: MESSAGE_SEND → MessageService.createMessage()
    - `room.handler.ts`: ROOM_CREATED → RoomService.createRoom()

### 3. Socket Event Names (AGENTS.md Rule #3)
- ✅ **Centralized Event Names**: All socket events come from `socket.events.ts`
- Event constant objects:
  - `MESSAGE_EVENTS`: SEND_MESSAGE, MESSAGE_CREATED, MESSAGE_UPDATED, MESSAGE_DELETED, MESSAGE_TYPING
  - `PRESENCE_EVENTS`: USER_ONLINE, USER_OFFLINE, USER_AWAY, USER_BACK, PRESENCE_LIST
  - `ROOM_EVENTS`: JOIN_ROOM, LEAVE_ROOM, ROOM_CREATED, ROOM_UPDATED, ROOM_DELETED, MEMBER_JOINED, MEMBER_LEFT
  - `SYSTEM_EVENTS`: ERROR, DISCONNECT, CONNECT
- Usage: Handlers import events → `socket.on(MESSAGE_EVENTS.SEND_MESSAGE, ...)`

### 4. Redis Client Management (AGENTS.md Rule #4)
- ✅ **Two Redis Clients**: `redisPublisher` and `redisSubscriber`
- Located in: `config/redis.ts`
- Usage:
  - `redisPublisher.publish()`: Services publish events for other clients
  - `redisSubscriber.subscribe()`: Socket connections subscribe to room channels
  - Never publish with subscriber ❌
- Examples:
  - `message.service.ts`: `redisPublisher.publish('room:id', {...})`
  - `socket/index.ts`: `redisSubscriber.subscribe('room:*', ...)`

### 5. Environment Variable Validation (AGENTS.md Rule #5)
- ✅ **Zod Validation**: All env vars validated at startup via `config/env.ts`
- Schema validates:
  - `NODE_ENV`, `PORT`
  - `DATABASE_URL` (required URL)
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
  - `JWT_SECRET` (min 32 chars)
  - `CORS_ORIGIN`
  - File upload settings
- **Crashes if missing**: App exits with error codes on validation failure

### 6. API Response Shape (AGENTS.md Requirement)
- ✅ **Consistent Response Format**: `{ success: boolean, data?: T, error?: string, pagination?: {...} }`
- Implemented via `middleware/error.middleware.ts`:
  - `sendSuccess()`: Sends success responses
  - `ApiError`: Custom error class
  - `errorMiddleware`: Global error handler
- All routes use `sendSuccess()` or error middleware
- Examples:
  ```json
  { "success": true, "data": {...} }
  { "success": true, "data": [...], "pagination": {"page": 1, "limit": 20, "total": 100, "pages": 5} }
  { "success": false, "error": "User not found" }
  ```

### 7. API Base Path
- ✅ **All routes under `/api/v1`**
- Mounted in `app.ts`:
  - `/api/v1/auth` → authRoutes
  - `/api/v1/users` → userRoutes
  - `/api/v1/rooms` → roomRoutes
  - `/api/v1/messages` → messageRoutes
  - `/api/v1/uploads` → uploadRoutes

### 8. File Naming Convention (AGENTS.md Rule)
- ✅ **Pattern: `feature.type.ts`**
- Examples:
  - `auth.service.ts`, `auth.routes.ts`, `auth.middleware.ts`
  - `message.service.ts`, `message.routes.ts`, `message.handler.ts`
  - `room.service.ts`, `room.routes.ts`, `room.handler.ts`
  - `user.service.ts`, `user.routes.ts`, `user.model.ts`
  - `socket.events.ts`, `socket.auth.ts`
  - `error.middleware.ts`

### 9. Request Lifecycle (HTTP)
- ✅ **Request → auth.middleware → route handler → service → model → response**
- Flow example:
  1. HTTP POST to `/api/v1/messages`
  2. `authMiddleware` validates JWT
  3. `messageRoutes` handler extracts data
  4. Calls `MessageService.createMessage()`
  5. Service validates room membership
  6. Service calls `MessageModel.create()`
  7. Model stores message
  8. Service publishes Redis event
  9. Route sends `{ success: true, data: message }`

### 10. Socket Lifecycle
- ✅ **Event → socket.auth middleware → handler → service → model → redis publish → ack**
- Flow example:
  1. Socket client emits `message:send`
  2. `socketAuthMiddleware` validates JWT
  3. `messageHandler` receives event
  4. Calls `MessageService.createMessage()`
  5. Service validates and creates message
  6. Service publishes to Redis `room:id` channel
  7. Handler emits `message:created` to room
  8. Handler sends ack to client

## File Structure

```
src/
├── config/          # Configuration (env, db, redis)
│   ├── env.ts       # ✅ Zod validation, crashes if missing
│   ├── db.ts        # Database placeholder
│   └── redis.ts     # ✅ Two clients: redisPublisher, redisSubscriber
├── middleware/      # Middleware
│   ├── auth.middleware.ts       # ✅ JWT validation for HTTP
│   ├── socket.auth.ts           # ✅ JWT validation for Socket
│   └── error.middleware.ts      # ✅ Global error handler, response shape
├── models/          # Data models
│   ├── User.model.ts
│   ├── Message.model.ts
│   ├── Room.model.ts
│   └── RoomMember.model.ts
├── types/           # Type definitions
│   ├── user.types.ts
│   ├── message.types.ts
│   ├── room.types.ts
│   └── socket.events.ts         # ✅ All event names here
├── services/        # ✅ All business logic
│   ├── auth.service.ts
│   ├── message.service.ts
│   ├── room.service.ts
│   ├── user.service.ts
│   └── upload.service.ts
├── routes/          # ✅ Only call services, no logic
│   ├── auth.routes.ts
│   ├── message.routes.ts
│   ├── room.routes.ts
│   ├── user.routes.ts
│   └── upload.routes.ts
├── socket/          # ✅ Socket handlers
│   ├── index.ts                 # Setup and socket auth
│   ├── message.handler.ts       # ✅ Only calls MessageService
│   ├── room.handler.ts          # ✅ Only calls RoomService
│   ├── presence.handler.ts      # ✅ Only calls AuthService
│   └── typing.handler.ts        # ✅ Broadcasting only
├── utils/           # Utilities
│   ├── hash.utils.ts
│   ├── jwt.utils.ts
│   └── pagination.utils.ts
├── app.ts           # Express app setup
└── index.ts         # Entry point, starts server

```

## Environment Variables Validation

✅ **Enforced at startup** (`src/index.ts` → loads `src/config/env.ts`)

Required vars with validation:
- `DATABASE_URL`: Must be valid URL
- `JWT_SECRET`: Min 32 characters
- `REDIS_HOST`, `REDIS_PORT`: Required for Redis connection
- `NODE_ENV`: One of [development, production, test]
- `PORT`: Must be number

**If missing, app exits immediately with error message.**

## Error Handling

✅ **Centralized via middleware**:
- `error.middleware.ts`: 
  - Catches all errors
  - Returns `ApiError` or generic 500
  - Respects response shape: `{ success: false, error: string }`

## Security Features

- ✅ JWT token validation (HTTP + Socket)
- ✅ Room membership checks
- ✅ Message ownership verification
- ✅ CORS configuration
- ✅ File upload validation

## Next Steps (For Production)

1. Replace in-memory models with actual database (Prisma, Mongoose)
2. Add bcrypt for password hashing
3. Add rate limiting middleware
4. Add request logging/monitoring
5. Add input validation (zod schemas for request bodies)
6. Add API documentation (Swagger/OpenAPI)
7. Add automated tests
8. Deploy with proper env vars
