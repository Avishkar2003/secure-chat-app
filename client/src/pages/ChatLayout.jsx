import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/chat/Sidebar';
import ChatRoom from '../components/chat/ChatRoom';
import WelcomeScreen from '../components/chat/WelcomeScreen';
import NotificationToastContainer from '../components/chat/NotificationToastContainer';
import { useNotificationListener, useRequestNotificationPermission } from '../components/chat/useNotifications';

const ChatLayout = () => {
    // Mount notification listeners
    useNotificationListener();
    useRequestNotificationPermission();

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#0d1418' }}>
            {/* Toast notifications (fixed, top-right) */}
            <NotificationToastContainer />

            {/* Sidebar */}
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <Sidebar />
            </div>

            {/* Main chat area */}
            <div className="hidden md:flex flex-1 flex-col">
                <Routes>
                    <Route path="/" element={<WelcomeScreen />} />
                    <Route path="/chat/:chatId" element={<ChatRoom />} />
                </Routes>
            </div>
        </div>
    );
};

export default ChatLayout;
