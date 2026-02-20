import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const API_URL = 'http://localhost:3001/api';

const SignupForm = ({ onSwitchToLogin, onSignupSuccess }) => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || data.error || 'Signup failed');
            // Trigger OTP verification
            onSignupSuccess({ email: form.email, phone: form.phone, isLogin: false });
        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setError('Cannot connect to server. Make sure the backend is running on port 3001.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: 'username', type: 'text', placeholder: 'Username', icon: FiUser },
        { name: 'email', type: 'email', placeholder: 'Email address', icon: FiMail },
        { name: 'phone', type: 'tel', placeholder: 'Phone number (optional)', icon: FiPhone },
        { name: 'password', type: showPassword ? 'text' : 'password', placeholder: 'Password', icon: FiLock },
        { name: 'confirmPassword', type: showPassword ? 'text' : 'password', placeholder: 'Confirm password', icon: FiLock },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
            <p className="text-gray-400 text-sm mb-6">Join SecureChat today</p>

            <form onSubmit={handleSubmit} className="space-y-3">
                {fields.map(({ name, type, placeholder, icon: Icon }) => (
                    <div key={name} className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Icon className="text-gray-500 w-4 h-4" />
                        </div>
                        <input
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            value={form[name]}
                            onChange={handleChange}
                            required={name !== 'phone'}
                            className="w-full bg-dark-100 text-white placeholder-gray-500 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                        {(name === 'password') && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300"
                            >
                                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                ))}

                {error && (
                    <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/20 mt-2"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating account...
                        </span>
                    ) : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-5">
                Already have an account?{' '}
                <button
                    onClick={onSwitchToLogin}
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                    Sign in
                </button>
            </p>
        </div>
    );
};

export default SignupForm;
