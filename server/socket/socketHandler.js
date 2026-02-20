const { Message, Chat, User } = require('../models');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
    // Track online users: userId -> socketId
    const onlineUsers = new Map();
    // Track which chat room each socket is currently viewing: socketId -> chatId
    const activeRoom = new Map();

    io.on('connection', (socket) => {
        const userId = (() => {
            try {
                const decoded = jwt.verify(
                    socket.handshake.auth?.token,
                    process.env.JWT_SECRET || 'secret'
                );
                return decoded.id;
            } catch { return null; }
        })();

        if (userId) {
            onlineUsers.set(userId, socket.id);
            io.emit('user_online', { userId });
            console.log(`User ${userId} connected`);
        }

        // Join a chat room
        socket.on('join_chat', ({ chatId }) => {
            socket.join(`chat:${chatId}`);
            activeRoom.set(socket.id, chatId);
        });

        // Leave a chat room
        socket.on('leave_chat', ({ chatId }) => {
            socket.leave(`chat:${chatId}`);
            activeRoom.delete(socket.id);
        });

        // Send message
        socket.on('send_message', async ({ chatId, message }) => {
            try {
                // Persist to DB (including file metadata)
                const saved = await Message.create({
                    content: message.content,
                    type: message.type || 'text',
                    sender_id: message.sender_id,
                    chat_id: chatId,
                    fileName: message.fileName || null,
                    fileSize: message.fileSize || null,
                });

                const fullMessage = {
                    ...message,
                    id: saved.id,
                    createdAt: saved.createdAt,
                    fileName: saved.fileName,
                    fileSize: saved.fileSize,
                };

                // Broadcast to all in room except sender
                socket.to(`chat:${chatId}`).emit('receive_message', fullMessage);

                // Send notification to chat members NOT currently viewing this chat
                try {
                    const chat = await Chat.findByPk(chatId, {
                        include: [{ model: User, as: 'members', attributes: ['id'] }],
                    });
                    if (chat?.members) {
                        for (const member of chat.members) {
                            if (member.id === userId) continue; // skip sender
                            const memberSocketId = onlineUsers.get(member.id);
                            if (!memberSocketId) continue; // offline
                            const memberCurrentRoom = activeRoom.get(memberSocketId);
                            if (memberCurrentRoom === String(chatId)) continue; // already viewing this chat
                            // Send notification
                            io.to(memberSocketId).emit('new_message_notification', {
                                chatId,
                                chatName: chat.name,
                                senderName: message.sender?.username || 'Someone',
                                preview: message.type === 'text'
                                    ? message.content.slice(0, 60)
                                    : message.type === 'image' ? '📷 Image'
                                        : message.type === 'pdf' ? '📄 PDF'
                                            : message.type === 'video' ? '🎥 Video'
                                                : '📎 File',
                                timestamp: saved.createdAt,
                            });
                        }
                    }
                } catch (notifErr) {
                    console.error('Notification error:', notifErr.message);
                }
            } catch (err) {
                console.error('Error saving message:', err.message);
                socket.emit('message_error', { error: err.message });
            }
        });

        // Typing events
        socket.on('typing', ({ chatId, userId, username }) => {
            socket.to(`chat:${chatId}`).emit('user_typing', { userId, username });
        });

        socket.on('stop_typing', ({ chatId, userId }) => {
            socket.to(`chat:${chatId}`).emit('user_stopped_typing', { userId });
        });

        // Disconnect
        socket.on('disconnect', () => {
            if (userId) {
                onlineUsers.delete(userId);
                activeRoom.delete(socket.id);
                io.emit('user_offline', { userId });
                console.log(`User ${userId} disconnected`);
            }
        });
    });
};
