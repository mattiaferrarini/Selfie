import { install, InstalledClock } from '@sinonjs/fake-timers';

let clock: InstalledClock | undefined; // the global clock

const setGlobalClock = (date: Date) => {
    if(clock)
        clock.uninstall();
    clock = install({ now: date, shouldAdvanceTime: true, shouldClearNativeTimers: true });

    console.log('Global clock set to:', date);
}

const restoreGlobalClock = () => {
    if(clock){
        clock.uninstall();
        clock = undefined;
    }

    console.log('Global clock restored to ', new Date());
} 

export default {
    setGlobalClock,
    restoreGlobalClock
}