import { v4 as uuidv4 } from 'uuid';
import { Message, MessageCreateInput } from '../types/message.types';

/**
 * Message Model - In-memory implementation (replace with actual DB)
 */

const messages = new Map<string, Message>();

export const MessageModel = {
    async create(input: MessageCreateInput): Promise<Message> {
        const message: Message = {
            id: uuidv4(),
            roomId: input.roomId,
            userId: input.userId,
            content: input.content,
            attachments: input.attachments || [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        messages.set(message.id, message);
        return message;
    },

    async findById(id: string): Promise<Message | null> {
        return messages.get(id) || null;
    },

    async findByRoomId(roomId: string, limit = 50, offset = 0): Promise<Message[]> {
        const roomMessages = Array.from(messages.values())
            .filter((m) => m.roomId === roomId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(offset, offset + limit);

        return roomMessages;
    },

    async update(id: string, data: Partial<Message>): Promise<Message | null> {
        const message = messages.get(id);
        if (!message) return null;

        const updated = { ...message, ...data, updatedAt: new Date() };
        messages.set(id, updated);
        return updated;
    },

    async delete(id: string): Promise<boolean> {
        return messages.delete(id);
    },

    async deleteByRoomId(roomId: string): Promise<number> {
        let count = 0;
        for (const [id, msg] of messages.entries()) {
            if (msg.roomId === roomId) {
                messages.delete(id);
                count++;
            }
        }
        return count;
    },
};
