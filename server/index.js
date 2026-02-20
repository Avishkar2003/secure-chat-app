const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const socketHandler = require('./socket/socketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Track DB connection state
let dbConnected = false;

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'running',
        database: dbConnected ? 'connected' : 'disconnected',
    });
});

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Secure Chat Server is running' });
});

// Socket.io
socketHandler(io);

// Sync database and start server
const PORT = process.env.PORT || 3001;

// Start server regardless of DB — health endpoint will report DB status
server.listen(PORT, async () => {
    console.log(`✅ Server running on port ${PORT}`);
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: false });
        dbConnected = true;
        console.log('✅ Database connected successfully');
    } catch (err) {
        dbConnected = false;
        console.error('❌ Database connection failed:', err.message);
        console.error('   → Start XAMPP MySQL and create the "secure_chat" database, then restart the server.');
    }
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.\n   Fix: run "fuser -k ${PORT}/tcp" then restart.`);
        process.exit(1);
    } else {
        throw err;
    }
});

