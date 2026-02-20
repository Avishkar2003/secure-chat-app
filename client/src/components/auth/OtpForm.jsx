import { useState, useRef, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const API_URL = 'http://localhost:3001/api';

const OtpForm = ({ pendingData, onBack }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = useRef([]);
    const { setUser } = useAuthStore();

    useEffect(() => {
        inputRefs.current[0]?.focus();
        const timer = setInterval(() => {
            setResendTimer((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...pendingData, otp: code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid OTP');
            setUser(data.user, data.token);
        } catch (err) {
            setError(err.message);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setResendTimer(30);
        // Call resend OTP endpoint
        await fetch(`${API_URL}/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: pendingData?.email || pendingData?.phone }),
        });
    };

    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
            </button>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600/20 rounded-2xl mb-4">
                    <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify your identity</h2>
                <p className="text-gray-400 text-sm">
                    Enter the 6-digit code sent to{' '}
                    <span className="text-white font-medium">
                        {pendingData?.email || pendingData?.phone}
                    </span>
                </p>
            </div>

            {/* OTP Input boxes */}
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-11 h-13 text-center text-xl font-bold bg-dark-100 text-white border rounded-xl py-3 focus:outline-none transition-all ${digit
                                ? 'border-primary-500 bg-primary-600/10'
                                : 'border-white/10 focus:border-primary-500'
                            }`}
                    />
                ))}
            </div>

            {error && (
                <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2 mb-4 text-center">{error}</p>
            )}

            <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length < 6}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/20"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying...
                    </span>
                ) : 'Verify OTP'}
            </button>

            <p className="text-center text-gray-400 text-sm mt-5">
                Didn&apos;t receive the code?{' '}
                <button
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className={`font-medium transition-colors ${resendTimer > 0
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-primary-400 hover:text-primary-300'
                        }`}
                >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
            </p>
        </div>
    );
};

export default OtpForm;
