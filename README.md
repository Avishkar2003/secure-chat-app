# Chat Application

A real-time chat application built with React, Node.js, Express, Socket.IO, and MySQL.

## Features

- User authentication with OTP verification
- Real-time messaging with Socket.IO
- Group chat support
- File uploads
- Emoji support
- Responsive design with Tailwind CSS

## Project Structure

- `client/` - React frontend (Vite)
- `server/` - Node.js backend (Express)

## Deployment

### Client (Vercel)
- Framework: Vite
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

### Server (Railway/Render recommended for WebSocket support)
- Root Directory: `server`
- Start Command: `npm start`

## Environment Variables

### Server
- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT secret key
- `EMAIL_USER` - Email service user
- `EMAIL_PASS` - Email service password
- `PORT` - Server port (default: 5000)

### Client
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.IO server URL

## Local Development

### Server
```bash
cd server
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```
