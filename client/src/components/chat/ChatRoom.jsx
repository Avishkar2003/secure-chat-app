import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiSend, FiPaperclip, FiSmile, FiPhone, FiVideo, FiMoreVertical, FiX, FiFile } from 'react-icons/fi';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { connectSocket, getSocket } from '../../services/socket';
import MessageBubble from './MessageBubble';

const API_BASE = 'http://localhost:3001/api';

const ChatRoom = () => {
    const { chatId } = useParams();
    const [text, setText] = useState('');
    const [typingUser, setTypingUser] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [filePreview, setFilePreview] = useState(null); // { file, url, type, name }
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const { user, token } = useAuthStore();
    const { messages, addMessage, activeChat } = useChatStore();

    const chatMessages = useMemo(() => messages[chatId] || [], [messages, chatId]);

    // Close emoji picker on outside click
    useEffect(() => {
        const handler = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Connect socket
    useEffect(() => {
        const socket = connectSocket(token);
        socket.emit('join_chat', { chatId });

        const handleReceive = (message) => addMessage(chatId, message);
        const handleTyping = ({ userId, username }) => {
            if (userId !== user.id) {
                setTypingUser(username);
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
            }
        };
        const handleStopTyping = ({ userId }) => {
            if (userId !== user.id) setTypingUser(null);
        };

        socket.on('receive_message', handleReceive);
        socket.on('user_typing', handleTyping);
        socket.on('user_stopped_typing', handleStopTyping);

        return () => {
            socket.emit('leave_chat', { chatId });
            socket.off('receive_message', handleReceive);
            socket.off('user_typing', handleTyping);
            socket.off('user_stopped_typing', handleStopTyping);
        };
    }, [chatId, token, user.id, addMessage]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, typingUser]);

    const handleTypingInput = (e) => {
        setText(e.target.value);
        const socket = getSocket();
        if (!socket) return;
        socket.emit('typing', { chatId, userId: user.id, username: user.username });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { chatId, userId: user.id });
        }, 2000);
    };

    const onEmojiSelect = (emoji) => {
        setText(prev => prev + emoji.native);
        setShowEmojiPicker(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image'
            : file.type === 'application/pdf' ? 'pdf'
                : file.type.startsWith('video/') ? 'video'
                    : 'file';
        setFilePreview({ file, url, type, name: file.name, size: file.size });
        e.target.value = '';
    };

    const clearFilePreview = () => {
        if (filePreview?.url) URL.revokeObjectURL(filePreview.url);
        setFilePreview(null);
    };

    const handleSend = useCallback(async () => {
        const socket = getSocket();
        const hasText = text.trim();
        const hasFile = !!filePreview;
        if (!hasText && !hasFile) return;

        let fileData = null;

        // Upload file first if present
        if (hasFile) {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', filePreview.file);
                const res = await fetch(`${API_BASE}/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                fileData = await res.json();
                clearFilePreview();
            } catch (err) {
                console.error('Upload failed:', err);
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        // Send message(s)
        if (fileData) {
            const fileMsg = {
                id: Date.now(),
                content: fileData.url,
                sender_id: user.id,
                sender: user,
                chat_id: chatId,
                type: fileData.type, // 'image' | 'pdf' | 'video' | 'file'
                fileName: fileData.name,
                fileSize: fileData.size,
                createdAt: new Date().toISOString(),
            };
            socket?.emit('send_message', { chatId, message: fileMsg });
            addMessage(chatId, fileMsg);
        }

        if (hasText) {
            const textMsg = {
                id: Date.now() + 1,
                content: text.trim(),
                sender_id: user.id,
                sender: user,
                chat_id: chatId,
                type: 'text',
                createdAt: new Date().toISOString(),
            };
            socket?.emit('send_message', { chatId, message: textMsg });
            addMessage(chatId, textMsg);
            setText('');
        }

        socket?.emit('stop_typing', { chatId, userId: user.id });
    }, [text, chatId, user, addMessage, filePreview, token]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="flex flex-col h-full" style={{ background: '#0d1418' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shadow-sm" style={{ background: '#17212b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}>
                        {activeChat?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {activeChat?.is_online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2" style={{ borderColor: '#17212b' }} />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{activeChat?.name || 'Chat'}</p>
                    <p className="text-xs text-gray-400">
                        {typingUser
                            ? <span className="text-green-400 animate-pulse">{typingUser} is typing...</span>
                            : activeChat?.is_online ? 'Online' : 'Last seen recently'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <FiPhone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <FiVideo className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <FiMoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-gray-500 text-sm">No messages yet. Say hello! 👋</p>
                    </div>
                )}
                {chatMessages.map((msg, idx) => (
                    <MessageBubble
                        key={msg.id || idx}
                        message={msg}
                        isOwn={msg.sender_id === user.id}
                        showAvatar={idx === 0 || chatMessages[idx - 1]?.sender_id !== msg.sender_id}
                    />
                ))}

                {/* Typing indicator */}
                {typingUser && (
                    <div className="flex items-end gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#16a34a' }}>
                            {typingUser[0]?.toUpperCase()}
                        </div>
                        <div className="rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: '#17212b', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex gap-1 items-center h-4">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {filePreview && (
                <div className="mx-4 mb-2 p-3 rounded-xl flex items-center gap-3" style={{ background: '#17212b', border: '1px solid rgba(22,163,74,0.3)' }}>
                    {filePreview.type === 'image' ? (
                        <img src={filePreview.url} alt="preview" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#0d1418' }}>
                            <FiFile className="w-7 h-7 text-green-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{filePreview.name}</p>
                        <p className="text-gray-400 text-xs">{formatFileSize(filePreview.size)}</p>
                    </div>
                    <button onClick={clearFilePreview} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0">
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="px-4 py-3" style={{ background: '#17212b', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
                        <Picker
                            data={data}
                            onEmojiSelect={onEmojiSelect}
                            theme="dark"
                            previewPosition="none"
                            skinTonePosition="none"
                        />
                    </div>
                )}

                <div className="flex items-end gap-2">
                    {/* Emoji button */}
                    <button
                        onClick={() => setShowEmojiPicker(v => !v)}
                        className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${showEmojiPicker ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <FiSmile className="w-5 h-5" />
                    </button>

                    {/* File attach button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex-shrink-0"
                        title="Attach image, PDF, or video"
                    >
                        <FiPaperclip className="w-5 h-5" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* Text input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={text}
                            onChange={handleTypingInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full text-white placeholder-gray-500 rounded-2xl py-3 px-4 text-sm outline-none resize-none max-h-32"
                            style={{ background: '#0d1418', border: '1px solid rgba(255,255,255,0.08)', scrollbarWidth: 'none' }}
                        />
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={(!text.trim() && !filePreview) || uploading}
                        className="p-2.5 text-white rounded-xl transition-all flex-shrink-0 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiSend className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
