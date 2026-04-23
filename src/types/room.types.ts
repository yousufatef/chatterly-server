/**
 * Room types
 */
export interface Room {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    members: string[];
    isPrivate: boolean;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RoomCreateInput {
    name: string;
    description?: string;
    createdBy: string;
    members?: string[];
    isPrivate?: boolean;
}

export interface RoomResponse {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    members: string[];
    isPrivate: boolean;
    avatar?: string;
    createdAt: Date;
    memberCount: number;
}
