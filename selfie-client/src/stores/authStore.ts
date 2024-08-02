import {defineStore} from 'pinia';
import notificationService from '@/services/notificationService';

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
            notificationService.subscribe();
        },
        setBirthday(birthday: Date) {
            this.user.birthday = birthday;
        },
        setRealName(realName: string) {
            this.user.realName = realName;
        },
        setPreferences(preferences: any) {
            this.user.preferences = preferences;
        },
        async clearAuthData() {
            this.user = null;
            this.isAuthenticated = false;
        },
    },
    persist: {
        storage: sessionStorage,
    }
});
