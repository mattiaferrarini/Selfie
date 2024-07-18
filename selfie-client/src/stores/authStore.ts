import {defineStore} from 'pinia';
import {useWebSocketStore} from "@/stores/wsStore";

/*interface User {
    username: string;
    real_name: string;
    preferences: {
        home: {
            calendarWeekly: boolean;
            notesDescription: boolean;
            pomodoroType: string;
        };
        notes: Object;
        pomodoro: {
            workDuration: number;
            pauseDuration: number;
            numberOfCycles: number;
        };
    };
}*/

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
            useWebSocketStore().connect();
        },
        setPreferences(preferences: any) {
            if (this.user)
                this.user.preferences = preferences;
        },
        clearAuthData() {
            this.user = null;
            this.isAuthenticated = false;
        },
    },
    persist: {
        storage: localStorage,
    }
});
