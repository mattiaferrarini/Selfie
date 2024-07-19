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
        setBirthday(birthday: Date) {
            this.user.birthday = birthday;
        },
        setRealName(real_name: string) {
            this.user.real_name = real_name;
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
