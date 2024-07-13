import {defineStore} from 'pinia';

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
        setPreferences(preferences: any) {
            this.user.preferences = preferences;
        },
        clearAuthData() {
            this.user = null;
            this.isAuthenticated = false;
        },
    },
    persist: {
        storage: sessionStorage,
    }
});
