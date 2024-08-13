import {defineStore} from 'pinia';
import {useWebSocketStore} from "@/stores/wsStore";
import notificationService from '@/services/notificationService';

interface AuthState {
    user: any;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        isAuthenticated: false,
        isAdmin: false
    }),
    actions: {
        setUser(user: any) {
            this.user = user;
            this.isAuthenticated = true;
            this.isAdmin = user.isAdmin;
            useWebSocketStore().connect();
            notificationService.subscribe();
        },
        setBirthday(birthday: Date) {
            this.user.birthday = birthday;
        },
        setRealName(realName: string) {
            this.user.realName = realName;
        },
        setPreferences(preferences: any) {
            if (this.user)
                this.user.preferences = preferences;
        },
        async clearAuthData() {
            this.user = null;
            this.isAuthenticated = false;
        },
    },
    persist: {
        storage: localStorage,
    }
});
