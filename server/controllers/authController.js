const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailService');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (user) =>
    jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

exports.signup = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;
        if (!username || !email) return res.status(400).json({ message: 'Username and email are required' });

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists with this email' });

        const password_hash = password ? await bcrypt.hash(password, 10) : null;
        const newUser = await User.create({
            username,
            email,
            phone: phone || null,  // convert empty string to null
            password_hash,
        });

        // Generate OTP and send via email
        const otp = generateOTP();
        otpStore.set(email, { otp, userId: newUser.id, expires: Date.now() + 5 * 60 * 1000 });

        try {
            await sendOtpEmail(email, otp, username);
        } catch (emailErr) {
            console.error('Email send failed, OTP:', otp, emailErr.message);
            // Still proceed — OTP logged to console as fallback
        }

        res.status(201).json({ message: 'Account created. OTP sent to your email.', requiresOtp: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        const where = email ? { email } : { phone };
        const user = await User.findOne({ where });
        if (!user) return res.status(404).json({ message: 'User not found. Please create an account.' });

        // --- Password login: verify and return JWT directly (no OTP) ---
        if (password) {
            if (!user.password_hash) {
                return res.status(401).json({ message: 'This account has no password set. Please use OTP login.' });
            }
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) return res.status(401).json({ message: 'Incorrect password. Please try again.' });

            // ✅ Password correct → issue token immediately, no OTP
            const token = signToken(user);
            return res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username, email: user.email, profile_picture: user.profile_picture },
            });
        }

        // --- Passwordless login: send OTP ---
        const otp = generateOTP();
        const identifier = email || phone;
        otpStore.set(identifier, { otp, userId: user.id, expires: Date.now() + 5 * 60 * 1000 });

        try {
            if (email) {
                await sendOtpEmail(email, otp, user.username);
            } else {
                console.log(`📱 SMS OTP for ${phone}: ${otp}`);
            }
        } catch (emailErr) {
            console.error('Email send failed, OTP:', otp, emailErr.message);
        }

        res.json({ message: 'OTP sent to your email', requiresOtp: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.verifyOtp = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;
        const identifier = email || phone;
        const record = otpStore.get(identifier);

        if (!record) return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
        if (Date.now() > record.expires) {
            otpStore.delete(identifier);
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

        otpStore.delete(identifier);
        const user = await User.findByPk(record.userId);
        const token = signToken(user);

        res.json({
            message: 'Verified successfully',
            token,
            user: { id: user.id, username: user.username, email: user.email, profile_picture: user.profile_picture }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { identifier } = req.body;
        const isEmail = identifier.includes('@');
        const where = isEmail ? { email: identifier } : { phone: identifier };
        const user = await User.findOne({ where });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = generateOTP();
        otpStore.set(identifier, { otp, userId: user.id, expires: Date.now() + 5 * 60 * 1000 });

        try {
            if (isEmail) {
                await sendOtpEmail(identifier, otp, user.username);
            } else {
                console.log(`📱 Resent OTP for ${identifier}: ${otp}`);
            }
        } catch (emailErr) {
            console.error('Resend email failed, OTP:', otp, emailErr.message);
        }

        res.json({ message: 'OTP resent to your email' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
