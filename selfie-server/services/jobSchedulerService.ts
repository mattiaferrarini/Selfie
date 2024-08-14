import { IActivity } from "../models/Activity";
import timeService from "./timeService";
import jobs from '../agenda/jobs';
import { IEvent } from "../models/Event";
import { agenda } from "../server";
import eventService from "./eventService";


// schedules the notification process for a late activity
const scheduleActivityNotification = async (activity: IActivity) => {
    const now = new Date();
    
    if(timeService.getEndOfDay(activity.deadline) < timeService.getEndOfDay(now)){
        await notifyActivityNow(activity);
    }
    else{
        await scheduleActivityNotificationStart(activity, timeService.moveAheadByDays(activity.deadline, 1));
    }
}

// schedules the START of activity notification for a specific activity
const scheduleActivityNotificationStart = async (activity: IActivity, date: Date) => {
    try {
        const jobName = jobs.activityNotificationStartJobName;
        const startOfDay = timeService.getStartOfDay(date);

        const job = agenda.create(jobName, {
            activityId: activity._id as String,
        });

        job.schedule(startOfDay);
        await job.save();
    }
    catch {
        console.error('Failed to schedule activity notification start');
    }
}

// immediately starts notifying activity according to settings
// it assumes the activity is already late
const notifyActivityNow = async (activity: IActivity) => {
    try {
        const now = new Date();
        const jobName = jobs.activityNotificationJobName;

        const job = agenda.create(jobName, {
            activityId: activity._id as String,
            end: timeService.getEndOfDay(now)
        });

        const numberOfReps = getNumberOfActivityNotifications(activity, now);
        const frequency = getDailyFrequencyString(numberOfReps);
        job.repeatEvery(frequency);
        await job.save();
    }
    catch {
        console.error('Failed to notify activity');
    }
}

// updates the scheduling of the notification process for an activity
// it deletes the current job and schedules a new one
const updateLateActivityNotification = async (activity: IActivity) => {
    try {
        await clearExistingActivityNotifications(activity);
        await scheduleActivityNotification(activity);
    }
    catch {
        console.error('Failed to update existing activity notifications');
    }
}

// deletes the current notification jobs for an activity
const clearExistingActivityNotifications = async (activity: IActivity) => {
    const activityId = activity._id as String;
    await agenda.cancel({ name: jobs.activityNotificationJobName, 'data.activityId': activityId });
}

// deletes the current notification jobs for an activity
const clearActivityNotificationById = async (activityId: String) => {
    await agenda.cancel({ name: jobs.activityNotificationJobName, 'data.activityId': activityId });
}

// returns the number of repetitions for a late activity an a specific date
// according to the activity's notification settings
const getNumberOfActivityNotifications = (activity: IActivity, date: Date) => {
    let res = 1;
    switch (activity.notification.repeat) {
        case 'daily':
            res = 1; break;
        case 'linear':
            res = timeService.dayDifference(date, activity.deadline, true);
        case 'exponential':
            res = Math.pow(2, timeService.dayDifference(date, activity.deadline, true));
        default:
            res = 1;
    }
    return Math.max(1, Math.min(res, 24 * 6));
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

// schedules the notification process for the next valid repetition of an event
// after a reference date or now if not provided
// if the notification period has already started, the notification process will start immediately
const scheduleEventNotification = async (event: IEvent, referenceDate?: Date) => {
    referenceDate = referenceDate || new Date();
    const now = new Date();

    const { start: nextStart, end: nextEnd } = eventService.getNextValidRepetition(event, referenceDate);
    
    if(nextStart && nextEnd) {
        if(getEventNotificationStart(event, nextStart) < now && now < nextStart) {
            // the notification process should have already started
            await notifyEventNow(event, nextStart, nextEnd);
        }else{
            await scheduleEventNotificationStart(event, nextStart, nextEnd);
        }
    }
    else{
        console.error('Failed to schedule event notification: no valid repetition found after', referenceDate);
    }
}

// schedules the START of event notification for a specific event's repetition
const scheduleEventNotificationStart = async (event: IEvent, eventRepStart: Date, eventRepEnd: Date) => {
    try {
        const jobName = jobs.eventNotificationStartJobName;

        // determine when notification should begin
        const notificationStart = getEventNotificationStart(event, eventRepStart);

        const job = agenda.create(jobName, {
            eventId: event._id as String,
            eventRepStart: eventRepStart,
            eventRepEnd: eventRepEnd
        });

        job.schedule(notificationStart);
        await job.save();
    }
    catch (error) {
        console.error('Failed to schedule event notification:', error);
    }
}

// immediately starts notifying event according to settings
// no checks for correcteness of time: it assumes this is the correct moment when notification should start
const notifyEventNow = async (event: IEvent, eventRepStart: Date, eventRepEnd: Date) => {
    try {
        const jobName = jobs.eventNotificationJobName;

        const job = agenda.create(jobName, {
            eventId: event._id as String,
            eventRepStart: eventRepStart,
            eventRepEnd: eventRepEnd
        });

        if (event.notification.when === 'atEvent') {
            job.run(); // the event is starting: notify now
        }
        else {
            // repeat every frequency until the event starts
            const frequency = event.notification.repeat;
            job.repeatEvery(frequency);
        }

        await job.save();
    }
    catch {
        console.error('Failed to notify event');
    }
}

// updates the scheduling of the notification process for an event
// it deletes the current job and schedules a new one
const updateUpcomingEventNotification = async (event: IEvent) => {
    try {
        await clearExistingEventNotifications(event);
        await scheduleEventNotification(event);
    }
    catch {
        console.error('Failed to update existing event notifications');
    }
}

// deletes the current notification jobs for an event
const clearExistingEventNotifications = async (event: IEvent) => {
    const eventId = event._id as String;
    await agenda.cancel({ name: jobs.eventNotificationJobName, 'data.eventId': eventId });
}

// deletes the current notification jobs for an event
const clearEventNotificationsById = async (eventId: String) => {
    await agenda.cancel({ name: jobs.eventNotificationJobName, 'data.eventId': eventId });
}

// returns the date when the notification process should start for an event's repetition
const getEventNotificationStart = (event: IEvent, repStartDate: Date) => {
    if (event.notification.when === 'atEvent')
        return repStartDate;
    else {
        const parts = event.notification.when.split(' ');
        const unit = parts[1];
        const value = parseInt(parts[0]);

        if (unit === 'minutes')
            return timeService.moveAheadByMinutes(repStartDate, -value);
        else if (unit === 'hours')
            return timeService.moveAheadByHours(repStartDate, -value);
        else if (unit === 'days')
            return timeService.moveAheadByDays(repStartDate, -value);
        else if (unit === 'weeks')
            return timeService.moveAheadByDays(repStartDate, -7 * value);
        else
            throw new Error('Invalid unit');
    }
}

export default {
    scheduleActivityNotification,
    updateLateActivityNotification,
    scheduleActivityNotificationStart,
    notifyActivityNow,
    clearActivityNotificationById,
    updateUpcomingEventNotification,
    clearEventNotificationsById,
    scheduleEventNotificationStart,
    scheduleEventNotification,
    notifyEventNow
}