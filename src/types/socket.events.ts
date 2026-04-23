/**
 * Socket event names - should come from @your-github-username/chatterly-types
 * All socket events must be defined here
 * 
 * TODO: Move to external package @your-github-username/chatterly-types
 * and install as dependency to share with client
 */

// Message events
export const MESSAGE_EVENTS = {
    SEND_MESSAGE: 'message:send',
    MESSAGE_CREATED: 'message:created',
    MESSAGE_UPDATED: 'message:updated',
    MESSAGE_DELETED: 'message:deleted',
    MESSAGE_TYPING: 'message:typing',
    MESSAGE_STOP_TYPING: 'message:stop-typing',
    ERROR: 'message:error',
} as const;

// Presence events
export const PRESENCE_EVENTS = {
    USER_ONLINE: 'presence:online',
    USER_OFFLINE: 'presence:offline',
    USER_AWAY: 'presence:away',
    USER_BACK: 'presence:back',
    PRESENCE_LIST: 'presence:list',
} as const;

// Room events
export const ROOM_EVENTS = {
    JOIN_ROOM: 'room:join',
    LEAVE_ROOM: 'room:leave',
    ROOM_CREATED: 'room:created',
    ROOM_UPDATED: 'room:updated',
    ROOM_DELETED: 'room:deleted',
    MEMBER_JOINED: 'room:member-joined',
    MEMBER_LEFT: 'room:member-left',
} as const;

// System events
export const SYSTEM_EVENTS = {
    ERROR: 'system:error',
    DISCONNECT: 'disconnect',
    CONNECT: 'connect',
} as const;

// Type for all socket event names
export type SocketEventName =
    | typeof MESSAGE_EVENTS[keyof typeof MESSAGE_EVENTS]
    | typeof PRESENCE_EVENTS[keyof typeof PRESENCE_EVENTS]
    | typeof ROOM_EVENTS[keyof typeof ROOM_EVENTS]
    | typeof SYSTEM_EVENTS[keyof typeof SYSTEM_EVENTS];

export const ALL_SOCKET_EVENTS = {
    ...MESSAGE_EVENTS,
    ...PRESENCE_EVENTS,
    ...ROOM_EVENTS,
    ...SYSTEM_EVENTS,
} as const;
