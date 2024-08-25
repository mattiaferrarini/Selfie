import { IActivity } from "../models/Activity";
import timeService from "./timeService";
import jobs from '../agenda/jobs';
import { IEvent } from "../models/Event";
import { agenda } from "../server-deploy";
import eventService from "./eventService";
import { Job } from "agenda";


// schedules the notification process for the next valid repetition of an event
// after a reference date or now if not provided
// if the notification period has already started, the notification process will start immediately
const scheduleEventNotification = async (event: IEvent, referenceDate?: Date) => {
    referenceDate = referenceDate || new Date();

    if (event.notification.method.length > 0) {
        const { start: nextStart, end: nextEnd } = eventService.getNextValidRepetition(event, referenceDate);

        if (nextStart && nextEnd) {
            scheduleEventNotificationStart(event, nextStart, nextEnd);
        }
        else {
            console.log('No valid repetition found after', referenceDate, 'for event', event.title, '=> No notifications will be scheduled');
        }
    }
    else {
        console.log('No notification method selected for event', event.title, '=> No notifications will be scheduled');
    }
}

// schedules the START of event notification for a specific event's repetition
const scheduleEventNotificationStart = async (event: IEvent, eventRepStart: Date, eventRepEnd: Date) => {
    try {
        console.log('scheduling event notification start for event', event.title);
        const jobName = jobs.eventNotificationStartJobName;

        // determine when notification should begin
        const notificationStart = getEventNotificationStart(event, eventRepStart);

        // TODO: check this data is necessary
        const jobData = {eventId: event._id, eventRepStart: eventRepStart, eventRepEnd: eventRepEnd};

        await agenda.schedule(notificationStart, jobName, jobData);
    }
    catch (error) {
        console.error('Failed to schedule event notification:', error);
    }
}

// notifies a single repetition of an event according to settings
const notifyEventRepetition = async (event: IEvent, eventRepStart: Date, eventRepEnd: Date) => {
    try {
        const jobName = jobs.eventNotificationJobName;

        // TODO: check this data is necessary
        const jobData = {eventId: event._id, eventRepStart: eventRepStart, eventRepEnd: eventRepEnd};

        // determine when notification should begin (computed again to limit agenda processing delay)
        let notificationStart = getEventNotificationStart(event, eventRepStart);
            
        // determine the number of notifications 
        const numberOfNotifications = getNumberOfEventNotifications(event);

        // determine the frequency of notifications in minutes
        const frequency = stringToMinutes(event.notification.repeat);

        // schedule the appropriate number of notifications for the current repetition
        for(let i = 0; i < numberOfNotifications; i++){
            await agenda.schedule(notificationStart, jobName, jobData);
            notificationStart = timeService.moveAheadByMinutes(notificationStart, frequency);
        }
    }
    catch {
        console.error('Failed to notify event');
    }
}

// updates the scheduling of the notification process for an event
// it deletes the current job and schedules a new one
const updateUpcomingEventNotification = async (event: IEvent) => {
    try {
        await clearEventNotifications(event);
        await scheduleEventNotification(event);
    }
    catch {
        console.error('Failed to update existing event notifications');
    }
}

// deletes the current notification jobs for an event
const clearEventNotifications = async (event: IEvent) => {
    console.log('clearing existing event notifications for event', event.title);

    const eventId = event._id;
    let deletedCount = await agenda.cancel({ name: jobs.eventNotificationStartJobName, 'data.eventId': eventId }) || 0;
    deletedCount += await agenda.cancel({ name: jobs.eventNotificationJobName, 'data.eventId': eventId }) || 0;

    console.log('Deleted', deletedCount, 'jobs.');
}

// returns the date when the notification process should start for an event's repetition
const getEventNotificationStart = (event: IEvent, repStartDate: Date) => {
    const ahead = stringToMinutes(event.notification.when);
    return timeService.moveAheadByMinutes(repStartDate, -ahead);
}

// returns the number of notifications for an event repetition
const getNumberOfEventNotifications = (event: IEvent) => {
    if(event.notification.repeat === 'never')
        return 1;
    else{
        const when = stringToMinutes(event.notification.when);
        const repeat = stringToMinutes(event.notification.repeat);
        return Math.ceil(when / repeat);
    }
}

// converts a string representing a time amount to the corresponding number of minutes
const stringToMinutes = (str: string) => {
    const parts = str.split(' ');
    const unit = parts[1];
    const value = parseInt(parts[0]);

    if (unit === 'minutes' || unit === 'minute')
        return value;
    else if (unit === 'hours' || unit === 'hour')
        return value * 60;
    else if (unit === 'days' || unit === 'day')
        return value * 60 * 24;
    else if (unit === 'weeks' || unit === 'week')
        return value * 60 * 24 * 7;
    else
        return 0;
}

// schedules the notification process for a late activity
const scheduleActivityNotification = async (activity: IActivity) => {
    if (activity.notification.method.length > 0) {
        if (!activity.done) {
            const now = new Date();

            if (timeService.getEndOfDay(activity.deadline) < timeService.getEndOfDay(now)) {
                // if the activity is already late, notify for today
                await scheduleActivityNotificationStart(activity, now);
            }
            else {
                await scheduleActivityNotificationStart(activity, timeService.moveAheadByDays(activity.deadline, 1));
            }
        }
        else {
            console.log('Activity', activity.title, 'is already done => No notifications will be scheduled');
        }
    }
    else {
        console.log('No notification method selected for activity', activity.title, '=> No notifications will be scheduled');
    }
}

// schedules the START of activity notification for a specific activity
const scheduleActivityNotificationStart = async (activity: IActivity, date: Date) => {
    try {
        const jobName = jobs.activityNotificationStartJobName;
        const startOfDay = timeService.getStartOfDay(date);
        await agenda.schedule(startOfDay, jobName, {activityId: activity._id});
    }
    catch {
        console.error('Failed to schedule activity notification start');
    }
}

// schedules notification for a late activity for the present day
const notifyActivityToday = async (activity: IActivity) => {
    try {
        const now = new Date();

        const jobName = jobs.activityNotificationJobName;
        // TODO: check data is necessary
        const jobData = {activityId: activity._id, end: timeService.getEndOfDay(now)};

        let notificationStart = timeService.getStartOfDay(now);
        const numberOfReps = getNumberOfActivityNotifications(activity, now);
        console.log('now:', now, 'numberOfReps:', numberOfReps);
        const frequency = Math.ceil(24 * 60 / numberOfReps);

        for(let i = 0; i < numberOfReps; i++){
            await agenda.schedule(notificationStart, jobName, jobData);
            notificationStart = timeService.moveAheadByMinutes(notificationStart, frequency);
        }
    }
    catch {
        console.error('Failed to notify activity');
    }
}

// updates the scheduling of the notification process for an activity
// it deletes the current job and schedules a new one
const updateLateActivityNotification = async (activity: IActivity) => {
    try {
        await clearActivityNotifications(activity);
        await scheduleActivityNotification(activity);
    }
    catch {
        console.error('Failed to update existing activity notifications');
    }
}

// deletes the current notification jobs for an activity
const clearActivityNotifications = async (activity: IActivity) => {
    console.log('clearing existing activity notifications for activity', activity.title);

    const activityId = activity._id;
    let deletedCount = await agenda.cancel({ name: jobs.activityNotificationStartJobName, 'data.activityId': activityId }) || 0;
    deletedCount += await agenda.cancel({ name: jobs.activityNotificationJobName, 'data.activityId': activityId }) || 0;

    console.log('Deleted', deletedCount, 'jobs.');
}


// returns the number of repetitions for a late activity an a specific date
// according to the activity's notification settings
const getNumberOfActivityNotifications = (activity: IActivity, date: Date) => {
    let res;
    switch (activity.notification.repeat) {
        case 'daily':
            res = 1; 
            break;
        case 'linear':
            res = timeService.dayDifference(date, activity.deadline, true);
            break;
        case 'exponential':
            res = Math.pow(2, timeService.dayDifference(date, activity.deadline, true));
            break;
        default:
            res = 1;
    }
    // allow at most a notification every 5 minutes
    return Math.max(1, Math.min(res, 24 * 12));
}

// returns a string representing the frequency of a notification
// that should happen numberOfRes times per day
const getDailyFrequencyString = (numberOfReps: number) => {
    if (numberOfReps <= 1) {
        return '1 day';
    }
    else {
        const min = Math.floor(60 * 24 / numberOfReps);
        return min === 1 ? '1 minute' : `${min} minutes`;
    }
}

// removes a job
const removeJob = async (job: Job) => {
    const deletedCount = await agenda.cancel({ _id: job.attrs._id });
    console.log('Deleted', deletedCount, 'jobs.');
}

// removes all scheduled jobs
const removeAllJobs = async () => {
    const deletedCount = await agenda.cancel({});
    console.log('Deleted', deletedCount, 'jobs.');
}

// removes all job scheduled to run before a date
const removeJobsBefore = async (date: Date) => {
    const deletedCount = await agenda.cancel({ nextRunAt: { $lt: date } });
    console.log('Deleted', deletedCount, 'jobs.');
}

// removes all jobs scheduled to run after a date
const removeJobsAfter = async (date: Date) => {
    const deletedCount = await agenda.cancel({ nextRunAt: { $gt: date } });
    console.log('Deleted', deletedCount, 'jobs.');
}

// stop all scheduled jobs
const stopAllJobs = async () => {
    await agenda.stop();
    console.log('Agenda stopped');
}

// resume all scheduled jobs
const resumeAllJobs = async () => {
    await agenda.start();
    await jobs.defineJobs(agenda);
    console.log('Agenda started');
}

export default {
    scheduleActivityNotification,
    updateLateActivityNotification,
    scheduleActivityNotificationStart,
    notifyActivityToday,
    updateUpcomingEventNotification,
    clearEventNotifications,
    clearActivityNotifications,
    scheduleEventNotificationStart,
    scheduleEventNotification,
    notifyEventRepetition,
    removeJob,
    removeAllJobs,
    removeJobsBefore,
    removeJobsAfter,
    stopAllJobs,
    resumeAllJobs
}