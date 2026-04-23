import { v4 as uuidv4 } from 'uuid';
import { Room, RoomCreateInput } from '../types/room.types';

/**
 * Room Model - In-memory implementation (replace with actual DB)
 */

const rooms = new Map<string, Room>();

export const RoomModel = {
    async create(input: RoomCreateInput): Promise<Room> {
        const room: Room = {
            id: uuidv4(),
            name: input.name,
            description: input.description,
            createdBy: input.createdBy,
            members: input.members || [input.createdBy],
            isPrivate: input.isPrivate || false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        rooms.set(room.id, room);
        return room;
    },

    async findById(id: string): Promise<Room | null> {
        return rooms.get(id) || null;
    },

    async findByIds(ids: string[]): Promise<Room[]> {
        return ids
            .map((id) => rooms.get(id))
            .filter((room): room is Room => room !== undefined);
    },

    async findByMember(userId: string): Promise<Room[]> {
        return Array.from(rooms.values()).filter((room) =>
            room.members.includes(userId),
        );
    },

    async update(id: string, data: Partial<Room>): Promise<Room | null> {
        const room = rooms.get(id);
        if (!room) return null;

        const updated = { ...room, ...data, updatedAt: new Date() };
        rooms.set(id, updated);
        return updated;
    },

    async addMember(roomId: string, userId: string): Promise<Room | null> {
        const room = rooms.get(roomId);
        if (!room) return null;

        if (!room.members.includes(userId)) {
            room.members.push(userId);
            room.updatedAt = new Date();
            rooms.set(roomId, room);
        }

        return room;
    },

    async removeMember(roomId: string, userId: string): Promise<Room | null> {
        const room = rooms.get(roomId);
        if (!room) return null;

        room.members = room.members.filter((id) => id !== userId);
        room.updatedAt = new Date();
        rooms.set(roomId, room);

        return room;
    },

    async delete(id: string): Promise<boolean> {
        return rooms.delete(id);
    },

    async findAll(limit = 50, offset = 0): Promise<Room[]> {
        return Array.from(rooms.values()).slice(offset, offset + limit);
    },
};
