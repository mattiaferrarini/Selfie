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
    BiChatDots,
    BiChevronExpand,
    BiCircleFill,
    BiSave,
    CoHome,
    CoOptions,
    FaUndo,
    GiTimeTrap,
    HiSearch,
    HiViewGridAdd,
    MdAdd,
    MdClose,
    MdDelete,
    MdDone,
    MdFlipcameraandroidOutlined,
    MdMarkemailunreadOutlined,
    MdModeeditoutline,
    MdNavigatebefore,
    MdNavigatenext,
    MdPauseRound,
    MdPlayarrowOutlined,
    MdQueuemusic,
    MdRemovecircleoutline,
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

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'


addIcons(CoHome, BiCalendar3, BiChatDots, MdStickynote2Outlined, MdTimerSharp, BiCalendar2Range, RiUserSettingsLine, MdPauseRound,
    RiLogoutCircleRLine, GiTimeTrap, MdFlipcameraandroidOutlined, MdRestartalt, MdSkipnext, MdPlayarrowOutlined,
    MdQueuemusic, MdSettingsRound, MdModeeditoutline, MdClose, MdNavigatenext, MdNavigatebefore, FaUndo, MdAdd,
    BiChevronExpand, CoOptions, BiSave, MdDone, MdRemovecircleoutline, BiCircleFill, HiSearch, HiViewGridAdd, MdDelete, 
    MdMarkemailunreadOutlined, BiChatDots);

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

// Transform toISOString to always use Locale
function decorateLocaleToISOString() {
    const originalToISOString = Date.prototype.toISOString;

    Date.prototype.toISOString = function () {
        const translatedDate = new Date(this.getTime() - this.getTimezoneOffset() * 60 * 1000);
        return originalToISOString.call(translatedDate);
    };
}

// Apply the decorator
decorateLocaleToISOString();

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedState);
app.use(pinia);
app.use(router);

app.component("v-icon", OhVueIcon);

app.component('VueDatePicker', VueDatePicker);

app.directive('click-outside', ClickOutside);

app.mount('#app');
