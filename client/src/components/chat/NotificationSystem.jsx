import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMessageCircle } from 'react-icons/fi';
import { useNotificationStore } from '../../store/notificationStore';
import { getSocket } from '../../services/socket';
import { useChatStore } from '../../store/chatStore';

/**
 * Mount this once at the top level (ChatLayout).
 * It listens for new_message_notification socket events and:
 * 1. Increments unread count for that chat in Sidebar
 * 2. Shows a WhatsApp-style toast popup
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
                new Notification(`${data.senderName} in ${data.chatName || 'Chat'}`, {
                    body: data.preview,
                    icon: '/favicon.ico',
                });
            }
        };

        socket.on('new_message_notification', handler);
        return () => socket.off('new_message_notification', handler);
    }, [activeChat, addUnread, addToast]);
};

// Request browser notification permission on mount
export const useRequestNotificationPermission = () => {
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);
};

// Toast notification component
const NotificationToast = ({ toast, onClose }) => {
    const navigate = useNavigate();
    const { clearUnread } = useNotificationStore();
    const { setActiveChat, chats } = useChatStore();

    const handleClick = () => {
        const chat = chats.find(c => String(c.id) === String(toast.chatId));
        if (chat) {
            setActiveChat(chat);
            clearUnread(toast.chatId);
        }
        navigate(`/chat/${toast.chatId}`);
        onClose();
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-start gap-3 cursor-pointer group"
            style={{
                background: '#17212b',
                border: '1px solid rgba(22,163,74,0.3)',
                borderRadius: 14,
                padding: '12px 14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                minWidth: 280,
                maxWidth: 340,
                animation: 'slideInRight 0.3s ease',
            }}
        >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}>
                {toast.senderName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-semibold truncate">{toast.senderName}</p>
                    <p className="text-gray-500 text-xs flex-shrink-0">{toast.chatName}</p>
                </div>
                <p className="text-gray-300 text-xs mt-0.5 truncate">{toast.preview}</p>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="text-gray-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
            >
                <FiX className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

// Toast container — render this once in ChatLayout
export const NotificationToastContainer = () => {
    const { toasts, removeToast } = useNotificationStore();

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed z-50 flex flex-col gap-2"
            style={{ top: 16, right: 16 }}
        >
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(110%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            {toasts.map(toast => (
                <NotificationToast
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};
