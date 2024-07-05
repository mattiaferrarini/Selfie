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
    MdTimerSharp,
    MdStickynote2Outlined,
    RiLogoutCircleRLine,
    RiUserSettingsLine,
    CoHome,
    GiTimeTrap
} from "oh-vue-icons/icons";

addIcons(CoHome, BiCalendar3, MdStickynote2Outlined, MdTimerSharp, BiCalendar2Range, RiUserSettingsLine, RiLogoutCircleRLine, GiTimeTrap);

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
app.use(pinia);
app.use(router);
app.component("v-icon", OhVueIcon);
app.mount('#app');
