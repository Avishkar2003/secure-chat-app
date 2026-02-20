import { useState } from 'react';
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const API_URL = 'http://localhost:3001/api';

const LoginForm = ({ onSwitchToSignup, onOtpRequired }) => {
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setUser } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const body = loginMethod === 'email'
                ? { email: identifier, password }
                : { phone: identifier, password };

            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            // If server requires OTP verification
            if (data.requiresOtp) {
                onOtpRequired({ identifier, isLogin: true });
            } else {
                setUser(data.user, data.token);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-6">Sign in to continue</p>

            {/* Login method toggle */}
            <div className="flex bg-dark-100 rounded-xl p-1 mb-6">
                <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${loginMethod === 'email'
                            ? 'bg-primary-600 text-white shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Email
                </button>
                <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${loginMethod === 'phone'
                            ? 'bg-primary-600 text-white shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Phone
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        {loginMethod === 'email'
                            ? <FiMail className="text-gray-500 w-4 h-4" />
                            : <FiPhone className="text-gray-500 w-4 h-4" />
                        }
                    </div>
                    <input
                        type={loginMethod === 'email' ? 'email' : 'tel'}
                        placeholder={loginMethod === 'email' ? 'Email address' : 'Phone number'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="w-full bg-dark-100 text-white placeholder-gray-500 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>

                {/* Password */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-500 w-4 h-4" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-dark-100 text-white placeholder-gray-500 border border-white/10 rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300"
                    >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                </div>

                {error && (
                    <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/20"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Signing in...
                        </span>
                    ) : 'Sign In'}
                </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
                Don&apos;t have an account?{' '}
                <button
                    onClick={onSwitchToSignup}
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                    Create account
                </button>
            </p>
        </div>
    );
};

export default LoginForm;
