import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

let socket = null;

export const connectSocket = (token) => {
    if (socket?.connected) return socket;
    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
    });
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
