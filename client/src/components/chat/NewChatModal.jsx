import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiMessageCircle, FiUsers, FiUserPlus } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3001/api';

const NewChatModal = ({ onClose }) => {
    const [tab, setTab] = useState('people'); // 'people' | 'group'
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [creating, setCreating] = useState(false);
    const { token } = useAuthStore();
    const { setActiveChat, addChat } = useChatStore();
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        searchRef.current?.focus();
    }, []);

    const searchUsers = (value) => {
        setQuery(value);
        clearTimeout(debounceRef.current);
        if (value.trim().length < 2) { setResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(value)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setResults(Array.isArray(data) ? data : []);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);
    };

    const startChat = async (targetUser) => {
        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ targetUserId: targetUser.id }),
            });
            const chat = await res.json();
            const enriched = { ...chat, name: targetUser.username, profile_picture: targetUser.profile_picture };
            addChat(enriched);
            setActiveChat(enriched);
            navigate(`/chat/${chat.id}`);
            onClose();
        } catch (err) {
            console.error('Failed to create chat:', err);
        } finally {
            setCreating(false);
        }
    };

    const toggleSelectUser = (user) => {
        setSelectedUsers(prev =>
            prev.find(u => u.id === user.id) ? prev.filter(u => u.id !== user.id) : [...prev, user]
        );
    };

    const createGroup = async () => {
        if (!groupName.trim() || selectedUsers.length < 1) return;
        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/chats/group`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: groupName.trim(), memberIds: selectedUsers.map(u => u.id) }),
            });
            const chat = await res.json();
            const enriched = { ...chat, name: groupName.trim() };
            addChat(enriched);
            setActiveChat(enriched);
            navigate(`/chat/${chat.id}`);
            onClose();
        } catch (err) {
            console.error('Failed to create group:', err);
        } finally {
            setCreating(false);
        }
    };

    const getInitials = (name) => name?.slice(0, 2).toUpperCase() || '?';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#17212b', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-white font-bold text-lg">New Conversation</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex mx-5 mt-4 rounded-xl overflow-hidden" style={{ background: '#0d1418' }}>
                    <button
                        onClick={() => setTab('people')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all rounded-xl ${tab === 'people' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FiMessageCircle className="w-4 h-4" /> Direct Message
                    </button>
                    <button
                        onClick={() => setTab('group')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all rounded-xl ${tab === 'group' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FiUsers className="w-4 h-4" /> New Group
                    </button>
                </div>

                <div className="p-5">
                    {/* Group name input */}
                    {tab === 'group' && (
                        <input
                            type="text"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="Group name..."
                            className="w-full mb-3 px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                            style={{ background: '#0d1418', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    )}

                    {/* Search input */}
                    <div className="relative mb-4">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={e => searchUsers(e.target.value)}
                            placeholder="Search by username or email..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                            style={{ background: '#0d1418', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                        {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>

                    {/* Selected users chips (group mode) */}
                    {tab === 'group' && selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {selectedUsers.map(u => (
                                <span key={u.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-white font-medium" style={{ background: '#16a34a' }}>
                                    {u.username}
                                    <button onClick={() => toggleSelectUser(u)} className="hover:text-red-300 transition-colors">
                                        <FiX className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Results */}
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {results.length === 0 && query.length >= 2 && !loading && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <FiUserPlus className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                No users found for "{query}"
                            </div>
                        )}
                        {query.length < 2 && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Type at least 2 characters to search
                            </div>
                        )}
                        {results.map(user => {
                            const isSelected = selectedUsers.find(u => u.id === user.id);
                            return (
                                <button
                                    key={user.id}
                                    onClick={() => tab === 'people' ? startChat(user) : toggleSelectUser(user)}
                                    disabled={creating}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/5 disabled:opacity-50"
                                    style={isSelected ? { background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)' } : {}}
                                >
                                    <div className="relative flex-shrink-0">
                                        {user.profile_picture ? (
                                            <img src={user.profile_picture} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}>
                                                {getInitials(user.username)}
                                            </div>
                                        )}
                                        {user.is_online && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2" style={{ borderColor: '#17212b' }} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{user.username}</p>
                                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                                    </div>
                                    {tab === 'people' ? (
                                        <FiMessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-green-600 border-green-600' : 'border-gray-600'}`}>
                                            {isSelected && <span className="text-white text-xs">✓</span>}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Create Group Button */}
                    {tab === 'group' && (
                        <button
                            onClick={createGroup}
                            disabled={!groupName.trim() || selectedUsers.length < 1 || creating}
                            className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}
                        >
                            {creating ? 'Creating...' : `Create Group${selectedUsers.length > 0 ? ` (${selectedUsers.length + 1} members)` : ''}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;
