import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from "@/views/LoginView.vue";
import {useAuthStore} from "@/stores/authStore";
import RegisterView from "@/views/RegisterView.vue";
import ProfileView from "@/views/ProfileView.vue";
import PomodoroView from "@/views/PomodoroView.vue";
import NoteView from "@/views/note/NoteView.vue";
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
    path: '/pomodoro',
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
    path: '/calendar',
    name: 'calendar',
    component: CalendarView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
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
    if (to.matched.some(record => record.meta.requiresAuth) && !authStore.isAuthenticated) {
        next({name: 'login'});
    } else if (to.matched.some(record => record.meta.requiresNotAuth) && authStore.isAuthenticated) {
        next({name: 'home'})
    } else {
        next();
    }
})

export default router
