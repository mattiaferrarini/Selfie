import { install, InstalledClock } from '@sinonjs/fake-timers';

let clock: InstalledClock | undefined; // the global clock

export const setGlobalClock = async(req: any, res: any) => {
    const { date } = req.body;
    try {
        if(clock)
            clock.uninstall();
        clock = install({ now: date, shouldAdvanceTime: true, shouldClearNativeTimers: true });
        res.status(200).send({ message: 'Global clock set to:', date });
    } catch (error) {
        res.status(500).send({ error: 'Error setting global clock' });
    }
}

export const restoreGlobalClock = async(req: any, res: any) => {
    try {
        if(clock){
            clock.uninstall();
            clock = undefined;
        }
        res.status(200).send({ message: 'Global clock restored to ', date: new Date() });
    } catch (error) {
        res.status(500).send({ error: 'Error restoring global clock' });
    }
}