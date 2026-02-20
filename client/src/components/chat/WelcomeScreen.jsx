import { FiMessageSquare } from 'react-icons/fi';

const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full bg-dark-300 text-center px-8">
        <div className="w-24 h-24 bg-dark-200 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
            <FiMessageSquare className="w-12 h-12 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">SecureChat</h2>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            Select a conversation from the sidebar to start chatting. Your messages are end-to-end encrypted.
        </p>
        <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">
            <span>🔒</span>
            <span>End-to-end encrypted</span>
        </div>
    </div>
);

export default WelcomeScreen;
