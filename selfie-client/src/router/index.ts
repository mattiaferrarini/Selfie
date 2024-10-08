import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from "@/views/LoginView.vue";
import {useAuthStore} from "@/stores/authStore";
import RegisterView from "@/views/RegisterView.vue";
import ProfileView from "@/views/ProfileView.vue";
import PomodoroView from "@/views/PomodoroView.vue";
import NoteView from "@/views/note/NoteView.vue";
import NoteEditView from "@/views/note/NoteEditView.vue";
import CalendarView from "@/views/CalendarView.vue";
import AdminView from '@/views/AdminView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/login/:message?',
        name: 'login',
        component: LoginView,
        meta: {
            requiresNotAuth: true
        }
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: {
            requiresNotAuth: true
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfileView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/pomodoro/:activityId?',
        name: 'pomodoro',
        component: PomodoroView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/note',
        name: 'note',
        component: NoteView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/note/:id',
        name: 'note-edit',
        component: NoteEditView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/calendar',
        name: 'calendar',
        component: CalendarView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminView,
        meta: {
            requiresAuth: true
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.path === '/admin') {
        if (!authStore.user.isAdmin) {
            next({name: 'home'});
            return;
        }
    }

    if (to.matched.some(record => record.meta.requiresAuth) && !authStore.isAuthenticated) {
        next({name: 'login'});
    } else if (to.matched.some(record => record.meta.requiresNotAuth) && authStore.isAuthenticated) {
        next({name: 'home'})
    } else {
        next();
    }
})

export default router
