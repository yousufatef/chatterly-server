import { RoomModel } from '../models/Room.model';
import { RoomMemberModel } from '../models/RoomMember.model';
import { MessageModel } from '../models/Message.model';
import { RoomCreateInput, RoomResponse } from '../types/room.types';
import { throwApiError } from '../middleware/error.middleware';

/**
 * Room Service - Contains ALL business logic for room management
 * Routes and socket handlers call this service, they never contain logic
 * 
 * Note: Event broadcasting is handled by Socket.io handlers, not here
 */

const formatRoomResponse = async (room: any): Promise<RoomResponse> => {
    const memberCount = room.members.length;

    return {
        id: room.id,
        name: room.name,
        description: room.description,
        createdBy: room.createdBy,
        members: room.members,
        isPrivate: room.isPrivate,
        avatar: room.avatar,
        createdAt: room.createdAt,
        memberCount,
    };
};

export const RoomService = {
    async createRoom(input: RoomCreateInput): Promise<RoomResponse> {
        // Validate input
        if (!input.name || input.name.trim().length === 0) {
            throwApiError(400, 'Room name is required');
        }

        // Create room
        const room = await RoomModel.create(input);

        return formatRoomResponse(room);
    },

    async getRoom(roomId: string, userId: string): Promise<RoomResponse> {
        const room = await RoomModel.findById(roomId);
        if (!room) {
            throwApiError(404, 'Room not found');
        }

        // Check access
        if (room.isPrivate && !room.members.includes(userId)) {
            throwApiError(403, 'Access denied to private room');
        }

        return formatRoomResponse(room);
    },

    async getRoomsForUser(userId: string): Promise<RoomResponse[]> {
        const rooms = await RoomModel.findByMember(userId);
        return Promise.all(rooms.map((room) => formatRoomResponse(room)));
    },

    async addMember(roomId: string, userId: string, requesterId: string): Promise<RoomResponse> {
        const room = await RoomModel.findById(roomId);
        if (!room) {
            throwApiError(404, 'Room not found');
        }

        // Check if requester is room member
        if (!room.members.includes(requesterId)) {
            throwApiError(403, 'Only room members can add new members');
        }

        // Check if user already member
        if (room.members.includes(userId)) {
            throwApiError(409, 'User is already a member');
        }

        // Add member
        const updated = await RoomModel.addMember(roomId, userId);

        return formatRoomResponse(updated);
    },

    async removeMember(roomId: string, userId: string, requesterId: string): Promise<RoomResponse> {
        const room = await RoomModel.findById(roomId);
        if (!room) {
            throwApiError(404, 'Room not found');
        }

        // Only room creator or the user themselves can remove
        if (requesterId !== room.createdBy && requesterId !== userId) {
            throwApiError(403, 'Not authorized to remove this member');
        }

        // Remove member
        const updated = await RoomModel.removeMember(roomId, userId);

        return formatRoomResponse(updated);
    },

    async deleteRoom(roomId: string, requesterId: string): Promise<void> {
        const room = await RoomModel.findById(roomId);
        if (!room) {
            throwApiError(404, 'Room not found');
        }

        // Only creator can delete
        if (room.createdBy !== requesterId) {
            throwApiError(403, 'Only room creator can delete');
        }

        // Delete all messages
        await MessageModel.deleteByRoomId(roomId);

        // Delete room
        await RoomModel.delete(roomId);
    },

    async updateRoom(roomId: string, data: Partial<any>, requesterId: string): Promise<RoomResponse> {
        const room = await RoomModel.findById(roomId);
        if (!room) {
            throwApiError(404, 'Room not found');
        }

        // Only creator can update
        if (room.createdBy !== requesterId) {
            throwApiError(403, 'Only room creator can update');
        }

        const updated = await RoomModel.update(roomId, data);

        return formatRoomResponse(updated);
    },
};
