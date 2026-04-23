/**
 * Message types
 */
export interface Message {
    id: string;
    roomId: string;
    userId: string;
    content: string;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MessageCreateInput {
    roomId: string;
    userId: string;
    content: string;
    attachments?: string[];
}

export interface MessageResponse {
    id: string;
    roomId: string;
    userId: string;
    content: string;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
    user?: {
        id: string;
        username: string;
        avatar?: string;
    };
}
