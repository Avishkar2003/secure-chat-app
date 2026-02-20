import { format } from 'date-fns';
import { FiCheck, FiFile, FiDownload } from 'react-icons/fi';

const MessageBubble = ({ message, isOwn, showAvatar }) => {
    const time = message.createdAt
        ? format(new Date(message.createdAt), 'HH:mm')
        : '';

    const getInitials = (name) => name?.slice(0, 2).toUpperCase() || '?';

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const renderContent = () => {
        switch (message.type) {
            case 'image':
                return (
                    <div className="overflow-hidden rounded-xl" style={{ maxWidth: 280 }}>
                        <a href={message.content} target="_blank" rel="noreferrer">
                            <img
                                src={message.content}
                                alt={message.fileName || 'Image'}
                                className="w-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ maxHeight: 300 }}
                            />
                        </a>
                        <div className="flex items-center justify-end gap-1 mt-1 px-1">
                            <span className="text-xs" style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : '#6b7280' }}>{time}</span>
                            {isOwn && <FiCheck className="w-3 h-3 text-green-400" />}
                        </div>
                    </div>
                );

            case 'pdf':
                return (
                    <div className="rounded-xl overflow-hidden" style={{ maxWidth: 280, background: isOwn ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3 p-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#dc2626' }}>
                                <span className="text-white text-xs font-bold">PDF</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{message.fileName || 'Document.pdf'}</p>
                                <p className="text-xs" style={{ color: isOwn ? 'rgba(255,255,255,0.5)' : '#6b7280' }}>{formatFileSize(message.fileSize)}</p>
                            </div>
                            <a
                                href={message.content}
                                download={message.fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors flex-shrink-0"
                            >
                                <FiDownload className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="flex items-center justify-end gap-1 px-3 pb-2">
                            <span className="text-xs" style={{ color: isOwn ? 'rgba(255,255,255,0.5)' : '#6b7280' }}>{time}</span>
                            {isOwn && <FiCheck className="w-3 h-3 text-green-400" />}
                        </div>
                    </div>
                );

            case 'video':
                return (
                    <div className="rounded-xl overflow-hidden" style={{ maxWidth: 320 }}>
                        <video
                            src={message.content}
                            controls
                            className="w-full rounded-xl"
                            style={{ maxHeight: 240 }}
                        />
                        <div className="flex items-center justify-end gap-1 mt-1 px-1">
                            <span className="text-xs" style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : '#6b7280' }}>{time}</span>
                            {isOwn && <FiCheck className="w-3 h-3 text-green-400" />}
                        </div>
                    </div>
                );

            case 'file':
                return (
                    <div className="rounded-xl overflow-hidden" style={{ maxWidth: 280, background: isOwn ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3 p-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#3b82f6' }}>
                                <FiFile className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{message.fileName || 'File'}</p>
                                <p className="text-xs" style={{ color: isOwn ? 'rgba(255,255,255,0.5)' : '#6b7280' }}>{formatFileSize(message.fileSize)}</p>
                            </div>
                            <a
                                href={message.content}
                                download={message.fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors flex-shrink-0"
                            >
                                <FiDownload className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                );

            default: // 'text'
                return (
                    <div
                        className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                        style={{
                            background: isOwn ? 'linear-gradient(135deg,#15803d,#16a34a)' : '#17212b',
                            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.06)',
                            color: '#fff',
                            maxWidth: 320,
                            wordBreak: 'break-word',
                        }}
                    >
                        {!isOwn && showAvatar && (
                            <p className="text-green-400 text-xs font-semibold mb-1">{message.sender?.username}</p>
                        )}
                        <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs" style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : '#6b7280' }}>{time}</span>
                            {isOwn && <FiCheck className="w-3 h-3 text-green-400" />}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`flex items-end gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            {!isOwn && (
                <div className="flex-shrink-0 w-7 h-7">
                    {showAvatar ? (
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}
                        >
                            {getInitials(message.sender?.username)}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Bubble */}
            {renderContent()}
        </div>
    );
};

export default MessageBubble;
