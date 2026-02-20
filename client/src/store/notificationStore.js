import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
    // { chatId: count } — unread counts per chat
    unreadCounts: {},
    // Toast notifications queue
    toasts: [],

    addUnread: (chatId) =>
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [chatId]: (state.unreadCounts[chatId] || 0) + 1,
            },
        })),

    clearUnread: (chatId) =>
        set((state) => {
            const next = { ...state.unreadCounts };
            delete next[chatId];
            return { unreadCounts: next };
        }),

    addToast: (toast) => {
        const id = Date.now();
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        // Auto-remove after 4 seconds
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 4000);
    },

    removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

    totalUnread: () => {
        const counts = get().unreadCounts;
        return Object.values(counts).reduce((a, b) => a + b, 0);
    },
}));
