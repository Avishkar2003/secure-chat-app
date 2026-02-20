const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'video/mp4', 'video/webm',
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed. Supported: images, PDF, video.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// Upload endpoint
router.post('/', auth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype.startsWith('image/') ? 'image'
        : req.file.mimetype === 'application/pdf' ? 'pdf'
            : req.file.mimetype.startsWith('video/') ? 'video'
                : 'file';

    res.json({
        url: fileUrl,
        type: fileType,
        name: req.file.originalname,
        size: req.file.size,
    });
});

// Error handler for multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 20MB.' });
        }
    }
    res.status(400).json({ message: err.message });
});

module.exports = router;
