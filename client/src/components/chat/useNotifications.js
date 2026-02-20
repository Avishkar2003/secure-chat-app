import { useEffect } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { getSocket } from '../../services/socket';
import { useChatStore } from '../../store/chatStore';

/**
 * Listen for new_message_notification socket events.
 * Increments unread counts and shows toast popups.
 * Mount this once in ChatLayout.
 */
export const useNotificationListener = () => {
    const { addUnread, addToast } = useNotificationStore();
    const { activeChat } = useChatStore();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (data) => {
            // Don't notify if user is already viewing that chat
            if (String(activeChat?.id) === String(data.chatId)) return;
            addUnread(data.chatId);
            addToast(data);
            // Browser notification (if permission granted)
            if (Notification.permission === 'granted') {
                new Notification(`${data.senderName} · ${data.chatName || 'Chat'}`, {
                    body: data.preview,
                    icon: '/favicon.ico',
                });
            }
        };

        socket.on('new_message_notification', handler);
        return () => socket.off('new_message_notification', handler);
    }, [activeChat, addUnread, addToast]);
};

/**
 * Request browser notification permission on mount.
 */
export const useRequestNotificationPermission = () => {
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);
};
