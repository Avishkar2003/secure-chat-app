import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit, FiLogOut, FiUsers } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import NewChatModal from './NewChatModal';

const Sidebar = () => {
    const [search, setSearch] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const { user, logout } = useAuthStore();
    const { chats, activeChat, setActiveChat } = useChatStore();
    const { unreadCounts, clearUnread } = useNotificationStore();
    const navigate = useNavigate();

    const filteredChats = chats.filter((chat) =>
        (chat.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleChatClick = (chat) => {
        setActiveChat(chat);
        clearUnread(chat.id);
        navigate(`/chat/${chat.id}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="flex flex-col h-full" style={{ background: '#17212b' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}>
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2" style={{ borderColor: '#17212b' }} />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm">{user?.username}</p>
                        <p className="text-green-400 text-xs">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowNewChat(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="New Chat"
                    >
                        <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-xl transition-all"
                        title="Logout"
                    >
                        <FiLogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-3 py-3">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full text-white placeholder-gray-500 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none transition-colors"
                        style={{ background: '#0d1418', border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#0d1418' }}>
                            <FiUsers className="w-7 h-7 text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">No chats yet</p>
                        <p className="text-gray-600 text-xs mt-1">Click the ✏️ icon to start a conversation</p>
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => handleChatClick(chat)}
                            className="w-full flex items-center gap-3 px-4 py-3 transition-all"
                            style={{
                                background: activeChat?.id === chat.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderRight: activeChat?.id === chat.id ? '3px solid #16a34a' : '3px solid transparent',
                            }}
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}>
                                    {chat.is_group ? <FiUsers className="w-5 h-5" /> : (chat.name?.[0]?.toUpperCase() || '?')}
                                </div>
                                {chat.is_online && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2" style={{ borderColor: '#17212b' }} />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between">
                                    <p className="text-white text-sm font-medium truncate">{chat.name || 'Unknown'}</p>
                                    {chat.lastMessageTime && (
                                        <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                                            {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: false })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="text-gray-400 text-xs truncate">
                                        {chat.lastMessage || 'No messages yet'}
                                    </p>
                                    {(unreadCounts[chat.id] || 0) > 0 && (
                                        <span className="ml-2 flex-shrink-0 min-w-5 h-5 px-1 bg-green-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                                            {unreadCounts[chat.id] > 99 ? '99+' : unreadCounts[chat.id]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
        </div>
    );
};

export default Sidebar;
