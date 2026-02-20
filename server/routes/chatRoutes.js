const express = require('express');
const router = express.Router();
const { Chat, User, Message } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
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

// Get all chats for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Chat, include: [{ model: Message, limit: 1, order: [['createdAt', 'DESC']] }] }]
        });
        res.json(user.Chats || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new 1-on-1 chat
router.post('/', auth, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const chat = await Chat.create({ is_group: false });
        const me = await User.findByPk(req.user.id);
        const other = await User.findByPk(targetUserId);
        if (!other) return res.status(404).json({ message: 'User not found' });
        await chat.addUsers([me, other]);
        res.status(201).json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a group chat
router.post('/group', auth, async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const inviteLink = require('crypto').randomBytes(8).toString('hex');
        const chat = await Chat.create({
            is_group: true,
            name,
            group_admin_id: req.user.id,
            invite_link: inviteLink,
        });
        const members = await User.findAll({ where: { id: [req.user.id, ...memberIds] } });
        await chat.addUsers(members);
        res.status(201).json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get messages for a chat
router.get('/:chatId/messages', auth, async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { chat_id: req.params.chatId },
            include: [{ model: User, attributes: ['id', 'username', 'profile_picture'] }],
            order: [['createdAt', 'ASC']],
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Join via invite link
router.post('/join/:inviteLink', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({ where: { invite_link: req.params.inviteLink } });
        if (!chat) return res.status(404).json({ message: 'Invalid invite link' });
        const user = await User.findByPk(req.user.id);
        await chat.addUser(user);
        res.json({ message: 'Joined group', chat });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
