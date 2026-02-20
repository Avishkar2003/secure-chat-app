const express = require('express');
const router = express.Router();
const { User, Chat } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Auth middleware
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Search users by username or email (excludes self)
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) return res.json([]);

        const users = await User.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.ne]: req.user.id } }, // exclude self
                    {
                        [Op.or]: [
                            { username: { [Op.like]: `%${q}%` } },
                            { email: { [Op.like]: `%${q}%` } },
                        ],
                    },
                ],
            },
            attributes: ['id', 'username', 'email', 'profile_picture', 'is_online', 'last_seen'],
            limit: 20,
        });

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user's profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'phone', 'profile_picture', 'is_online'],
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
