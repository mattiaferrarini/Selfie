import { install, InstalledClock } from '@sinonjs/fake-timers';
import Event from '../models/Event';
import jobSchedulerService from '../services/jobSchedulerService';
import Activity from '../models/Activity';
import timeService from '../services/timeService';

let clock: InstalledClock | undefined; // the global clock

export const setGlobalClock = async(req: any, res: any) => {
    const date = new Date(req.body.date);
    try {
        // remove all scheduled jobs to prevent conflicts when setting the global clock
        await jobSchedulerService.removeAllJobs();
        // set the global clock
        if(clock)
            clock.uninstall();
        clock = install({ now: date, shouldAdvanceTime: true, shouldClearNativeTimers: true });
        // reschedule notifications
        await rescheduleNotifications(timeService.getStartOfDay(new Date()));

        console.log('Global clock set to:', date);
        res.status(200).send({ message: 'Global clock set to:', date });
    } catch (error) {
        res.status(500).send({ error: 'Error setting global clock' });
    }
}

export const restoreGlobalClock = async(req: any, res: any) => {
    try {
        // remove all scheduled jobs to prevent conflicts when restoring the global clock
        await jobSchedulerService.removeAllJobs();
        // restore the global clock
        if(clock){
            clock.uninstall();
            clock = undefined;
        }
        // reschedule notifications
        await rescheduleNotifications(timeService.getStartOfDay(new Date()));

        res.status(200).send({ message: 'Global clock restored to ', date: new Date() });
        console.log('Global clock restored to ', new Date());
    } catch (error) {
        res.status(500).send({ error: 'Error restoring global clock' });
    }
}

const rescheduleNotifications = async (after: Date) => {
    await rescheduleEventNotifications(after);
    await rescheduleActivityNotifications();
}

const rescheduleEventNotifications = async (after: Date) => {
    const events = await Event.find();
    for (const event of events)
        await jobSchedulerService.scheduleEventNotification(event, after);
}

const rescheduleActivityNotifications = async () => {
    const activities = await Activity.find();
    for (const activity of activities){
        await jobSchedulerService.scheduleActivityNotification(activity);
    }
}