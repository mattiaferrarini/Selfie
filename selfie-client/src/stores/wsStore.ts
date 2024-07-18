// src/stores/websocketStore.ts
import {defineStore} from 'pinia';
import chatService from '@/services/chatService';
import {useAuthStore} from "@/stores/authStore";

export interface IMessage {
    text: string;
    senderUsername: string;
    receiverUsername: string;
    createdAt: Date;
}

export interface message {
    user: string,
    text: string,
    date: Date
}

export const useWebSocketStore = defineStore('websocket', {
    state: () => ({
        ws: null as WebSocket | null,
        unread: false,
        messages: new Map<string, message[]>(),
        isChatModalOpen: false,
    }),
    actions: {
        connect() {
            if (!this.ws) {
                this.ws = new WebSocket(process.env.VUE_APP_WS_URL);
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    const username = useAuthStore().user?.username;
                    chatService.list().then(messages => messages.forEach((message: IMessage) => {
                        const withUser = message.senderUsername == username ? message.receiverUsername : message.senderUsername;
                        if (!this.messages.has(withUser)) {
                            this.messages.set(withUser, []);
                        }
                        this.messages.get(withUser)?.push({
                            user: message.senderUsername,
                            text: message.text,
                            date: message.createdAt
                        });
                    }));
                };
                this.ws.onerror = (error) => console.error('WebSocket error:', error);
                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.from && message.text) {
                            // create a new entry if it does not exist
                            if (!this.messages.has(message.from)) {
                                this.messages.set(message.from, []);
                            }
                            this.messages.get(message.from)?.unshift({
                                user: message.from,
                                text: message.text,
                                date: new Date()
                            });
                            if (!this.isChatModalOpen) {
                                this.unread = true;
                            }
                        }
                    } catch (err) {
                        // TODO: display?
                        console.log(err);
                    }
                };
            }
        },
        disconnect() {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
                this.ws = null;
                this.messages = new Map<string, message[]>();
            }
        },
        sendMessage(to: string, text: string) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                const username = useAuthStore().user?.username;
                const message = {to, text};
                this.ws.send(JSON.stringify(message));
                if (!this.messages.has(to)) {
                    this.messages.set(to, []);
                }
                this.messages.get(to)?.unshift({user: username, text, date: new Date()});
            }
        },
        setChatModalOpen(isOpen: boolean) { // Add this method
            this.isChatModalOpen = isOpen;
            this.unread = false;
        },
    },
});