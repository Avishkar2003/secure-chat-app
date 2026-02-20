import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useNotificationStore } from '../../store/notificationStore';
import { useChatStore } from '../../store/chatStore';

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
            className="flex items-start gap-3 cursor-pointer"
            style={{
                background: '#17212b',
                border: '1px solid rgba(22,163,74,0.35)',
                borderRadius: 14,
                padding: '12px 14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                minWidth: 280,
                maxWidth: 340,
                animation: 'slideInRight 0.3s ease',
            }}
        >
            {/* Avatar */}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}
            >
                {toast.senderName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-semibold truncate">{toast.senderName}</p>
                    {toast.chatName && (
                        <p className="text-gray-500 text-xs flex-shrink-0">{toast.chatName}</p>
                    )}
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

const NotificationToastContainer = () => {
    const { toasts, removeToast } = useNotificationStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed z-50 flex flex-col gap-2" style={{ top: 16, right: 16 }}>
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

export default NotificationToastContainer;
