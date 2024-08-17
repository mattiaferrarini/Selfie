import { install, InstalledClock } from '@sinonjs/fake-timers';
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL + '/timeMachine';

let clock: InstalledClock | undefined; // the global clock

const setGlobalClock = async (date: Date) => {
    if(clock)
        clock.uninstall();
    clock = install({ now: date, shouldAdvanceTime: true, shouldClearNativeTimers: true });

    try {
        const response = await axios.post(`${API_URL}/setGlobalClock`, { date }, { withCredentials: true });
        console.log(response.data);
    }
    catch (error) {
        console.log(error);
    }
}

const restoreGlobalClock = async () => {
    if(clock){
        clock.uninstall();
        clock = undefined;
    }

    try {
        const response = await axios.post(`${API_URL}/restoreGlobalClock`, {}, { withCredentials: true });
        console.log(response.data);
    }
    catch (error) {
        console.log(error);
    }
} 

export default {
    setGlobalClock,
    restoreGlobalClock
}