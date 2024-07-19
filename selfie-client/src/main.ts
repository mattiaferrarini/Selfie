import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {createPinia} from 'pinia';
import './assets/tailwind.css';
import piniaPluginPersistedState from "pinia-plugin-persistedstate"
import {addIcons, OhVueIcon} from 'oh-vue-icons';
import {
    BiCalendar2Range,
    BiCalendar3,
    CoHome,
    GiTimeTrap,
    MdClose,
    MdFlipcameraandroidOutlined,
    MdModeeditoutline,
    MdPauseRound,
    MdPlayarrowOutlined,
    MdQueuemusic,
    MdRestartalt,
    MdSettingsRound,
    MdSkipnext,
    MdStickynote2Outlined,
    MdTimerSharp,
    RiLogoutCircleRLine,
    RiUserSettingsLine
} from "oh-vue-icons/icons";
import ClickOutside from "@/directives/ClickOutside";
import {useAuthStore} from "@/stores/authStore";
import axios from "axios";

addIcons(CoHome, BiCalendar3, MdStickynote2Outlined, MdTimerSharp, BiCalendar2Range, RiUserSettingsLine, MdPauseRound,
    RiLogoutCircleRLine, GiTimeTrap, MdFlipcameraandroidOutlined, MdRestartalt, MdSkipnext, MdPlayarrowOutlined,
    MdQueuemusic, MdSettingsRound, MdModeeditoutline, MdClose);

// setup automatic response to 401 (Unauthenticated)
axios.interceptors.response.use((response: any) => {
    return response;
}, (error: any) => {
    if (error.response && error.response.status === 401) {
        const authStore = useAuthStore();
        authStore.clearAuthData();
        router.push({name: 'login', params: {message: 'Your session has expired. Please login again.'}});
    }
    return Promise.reject(error);
});

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedState);
app.use(pinia);
app.use(router);

app.component("v-icon", OhVueIcon);

app.directive('click-outside', ClickOutside);

app.mount('#app');
