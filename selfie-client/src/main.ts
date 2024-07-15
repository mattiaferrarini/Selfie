import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {createPinia} from 'pinia';
import './assets/tailwind.css';
import piniaPluginPersistedState from "pinia-plugin-persistedstate"
import {addIcons, OhVueIcon} from 'oh-vue-icons';
import {
    BiCalendar2Range,
    BiCalendar3, BiChatDots,
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

addIcons(CoHome, BiCalendar3, MdStickynote2Outlined, MdTimerSharp, BiCalendar2Range, RiUserSettingsLine, MdPauseRound,
    RiLogoutCircleRLine, GiTimeTrap, MdFlipcameraandroidOutlined, MdRestartalt, MdSkipnext, MdPlayarrowOutlined,
    MdQueuemusic, MdSettingsRound, MdModeeditoutline, MdClose, BiChatDots );

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedState);
app.use(pinia);
app.use(router);

app.component("v-icon", OhVueIcon);

app.directive('click-outside', ClickOutside);

app.mount('#app');
