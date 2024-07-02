// src/stores/authStore.ts
import { defineStore } from 'pinia';

interface AuthState {
    user: any;
    isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        isAuthenticated: false,
    }),
    actions: {
        setUser(user: any) {
            this.user = user;
            this.isAuthenticated = true;
        },
        clearAuthData() {
            this.user = null;
            this.isAuthenticated = false;
        },
    },
});
