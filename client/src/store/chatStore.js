import { create } from 'zustand';

export const useChatStore = create((set) => ({
    chats: [],
    activeChat: null,
    messages: {},
    setChats: (chats) => set({ chats }),
    setActiveChat: (chat) => set({ activeChat: chat }),
    addChat: (chat) =>
        set((state) => ({
            chats: state.chats.find((c) => c.id === chat.id)
                ? state.chats
                : [chat, ...state.chats],
        })),
    addMessage: (chatId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [chatId]: [...(state.messages[chatId] || []), message],
            },
        })),
    setMessages: (chatId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [chatId]: messages },
        })),
}));
