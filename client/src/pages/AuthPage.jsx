import { useState, useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import OtpForm from '../components/auth/OtpForm';

const AuthPage = () => {
    const [view, setView] = useState('login'); // 'login' | 'signup' | 'otp'
    const [pendingData, setPendingData] = useState(null);
    const [dbStatus, setDbStatus] = useState(null); // null | 'connected' | 'disconnected'

    // Check server + DB health on mount
    useEffect(() => {
        fetch('http://localhost:3001/api/health')
            .then(r => r.json())
            .then(data => setDbStatus(data.database))
            .catch(() => setDbStatus('server_down'));
    }, []);

    const handleSignupSuccess = (data) => {
        setPendingData(data);
        setView('otp');
    };

    const handleLoginOtp = (data) => {
        setPendingData(data);
        setView('otp');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0d1418' }}>
            {/* Background gradient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#16a34a' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#15803d' }} />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo / Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: '#16a34a', boxShadow: '0 8px 32px rgba(22,163,74,0.3)' }}>
                        <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.45z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">SecureChat</h1>
                    <p className="text-gray-400 mt-1 text-sm">End-to-end encrypted messaging</p>
                </div>

                {/* DB Status Banner */}
                {dbStatus === 'server_down' && (
                    <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                        <span>🔴</span>
                        <span>Cannot reach server. Make sure the backend is running: <code className="font-mono">npm run dev</code> in the server folder.</span>
                    </div>
                )}
                {dbStatus === 'disconnected' && (
                    <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', color: '#fde047' }}>
                        <span>⚠️</span>
                        <span>Database not connected. Start <strong>XAMPP MySQL</strong> and create the <code className="font-mono">secure_chat</code> database, then restart the server.</span>
                    </div>
                )}
                {dbStatus === 'connected' && (
                    <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)', color: '#86efac' }}>
                        <span>✅</span>
                        <span>Server and database connected</span>
                    </div>
                )}

                {/* Card */}
                <div className="rounded-2xl shadow-2xl p-8" style={{ background: '#17212b', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {view === 'login' && (
                        <LoginForm
                            onSwitchToSignup={() => setView('signup')}
                            onOtpRequired={handleLoginOtp}
                        />
                    )}
                    {view === 'signup' && (
                        <SignupForm
                            onSwitchToLogin={() => setView('login')}
                            onSignupSuccess={handleSignupSuccess}
                        />
                    )}
                    {view === 'otp' && (
                        <OtpForm
                            pendingData={pendingData}
                            onBack={() => setView(pendingData?.isLogin ? 'login' : 'signup')}
                        />
                    )}
                </div>

                <p className="text-center text-gray-500 text-xs mt-6">
                    🔒 Messages are end-to-end encrypted
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
