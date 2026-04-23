import { v4 as uuidv4 } from 'uuid';

/**
 * RoomMember Model - Track room membership
 */

const roomMembers = new Map<string, string[]>();

export const RoomMemberModel = {
    async addMember(roomId: string, userId: string): Promise<void> {
        const members = roomMembers.get(roomId) || [];
        if (!members.includes(userId)) {
            members.push(userId);
            roomMembers.set(roomId, members);
        }
    },

    async removeMember(roomId: string, userId: string): Promise<void> {
        const members = roomMembers.get(roomId) || [];
        roomMembers.set(
            roomId,
            members.filter((id) => id !== userId),
        );
    },

    async getMembers(roomId: string): Promise<string[]> {
        return roomMembers.get(roomId) || [];
    },

    async getMemberCount(roomId: string): Promise<number> {
        return (roomMembers.get(roomId) || []).length;
    },

    async isUserMember(roomId: string, userId: string): Promise<boolean> {
        const members = roomMembers.get(roomId) || [];
        return members.includes(userId);
    },

    async clearRoom(roomId: string): Promise<void> {
        roomMembers.delete(roomId);
    },
};
