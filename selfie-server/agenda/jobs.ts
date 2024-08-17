import Agenda, { Job } from "agenda";
import Event, { IEvent } from "../models/Event";
import Activity, { IActivity } from "../models/Activity";
import jobSchedulerService from "../services/jobSchedulerService";
import timeService from "../services/timeService";
import notificationController from "../controllers/notificationController";
import { findByUsername } from "../controllers/userController";


const eventNotificationStartJobName = 'event notification start';
const activityNotificationStartJobName = 'activity notification start';

const eventNotificationJobName = 'event notification';
const activityNotificationJobName = 'activity notification';

const defineJobs = async (agenda: Agenda) => {
    await defineEventNotificationStart(agenda);
    await defineEventNotification(agenda);
    await defineActivityNotificationStart(agenda);
    await defineActivityNotification(agenda);
}

// this is the job that STARTS the notification process for an event
// it schedules all the notifications for the current repetition of the event
// it also schedules the START of the notification process for the next repetition (if any)
const defineEventNotificationStart = async (agenda: Agenda) => {
    agenda.define(eventNotificationStartJobName, async (job: Job) => {
        try {
            const event = await Event.findById(job.attrs.data.eventId);
            const eventRepStart = new Date(job.attrs.data.eventRepStart);
            const eventRepEnd = new Date(job.attrs.data.eventRepEnd);

            if (!event) {
                // the event doesn't exist anymore: there's nothing to do
                console.error('Event not found:', job.attrs.data.eventId);
            }
            else {
                // notify participants now for the current repetition
                await jobSchedulerService.notifyEventNow(event, eventRepStart, eventRepEnd);

                // schedule notification start for the next repetition (if any)
                await jobSchedulerService.scheduleEventNotification(event, timeService.getStartOfDay(timeService.moveAheadByDays(eventRepEnd, 1)));
            }

            // remove the current job as it has already been executed
            await jobSchedulerService.removeJob(job);
        }
        catch (error) {
            console.error('Failed to start notify event:', error);
        }
    });
}

// this is the job that sends notifications for the current repetition of the event
const defineEventNotification = async (agenda: Agenda) => {
    agenda.define(eventNotificationJobName, async (job: Job) => {
        try {
            const event = await Event.findById(job.attrs.data.eventId);

            if (!event) {
                // the event doesn't exist anymore: remove the job
                await jobSchedulerService.removeJob(job);
                console.error('Event not found:', job.attrs.data.eventId);
            }
            else if (event.notification.when === 'atEvent' || event.notification.repeat === 'never') {
                // the notification should be sent only once: now
                await sendNotificationsForEvent(event);
                await jobSchedulerService.removeJob(job);
            }
            else { 
                // repeated notification case
                const eventRepStart = new Date(job.attrs.data.eventRepStart);
                const now = new Date();

                if (now > eventRepStart) {
                    // the event has already started: remove the job
                    await jobSchedulerService.removeJob(job);
                }
                else {
                    // send notifications to participants
                    sendNotificationsForEvent(event);
                }
            }
        }
        catch (error) {
            console.error('Failed to notify event:', error);
        }
    });
}

// sends notifications to participants of an event
const sendNotificationsForEvent = async (event: IEvent) => {

    const title = `Event ${event.title} is starting soon!`;
    const body = `You have an event at ${event.start}. Don't miss it!`;

    for (const participant of event.participants) {
        if (participant.status === 'accepted' && participant.email) {
            if (event.notification.method.includes('email')) {
                try {
                    notificationController.sendEmailNotification(participant.email, title, body);
                }
                catch (error) {
                    console.error(`Failed to send email to ${participant.email}:`, error);
                }
            }
            if (event.notification.method.includes('os')) {
                try {
                    const user = await findByUsername(participant.username);
                    if (user)
                        notificationController.sendPushNotification(user, { title: title, body: body });
                    else
                        console.error(`Failed to send push notification to ${participant.email}: User not found`);
                }
                catch {
                    console.error(`Failed to send push notification to ${participant.email}`);
                }
            }
        }
    }
}

// this is the job that STARTS the notification process for an activity for a day
// it also schedules itself for the next day
const defineActivityNotificationStart = async (agenda: Agenda) => {
    agenda.define(activityNotificationStartJobName, async (job: Job) => {
        try {
            const activity = await Activity.findById(job.attrs.data.activityId);

            if (!activity || activity.done) {
                // the activity doesn't exist anymore or it has been completed: there's nothing to do
                console.error('Activity not found or already done:', job.attrs.data.activityId);
            }
            else {
                // start the notifications for the day
                await jobSchedulerService.notifyActivityNow(activity);

                // schedule this job for the next day
                const tomorrow = timeService.moveAheadByDays(new Date(), 1);
                await jobSchedulerService.scheduleActivityNotificationStart(activity, tomorrow);
            }

            // remove the current job as it has already been executed
            await jobSchedulerService.removeJob(job);
        }
        catch (error) {
            console.error('Failed to start notify activity:', error);
        }
    });
}

// this is the job that sends notifications for the current day for a specific activity
const defineActivityNotification = async (agenda: Agenda) => {
    agenda.define(activityNotificationJobName, async (job: Job) => {
        try {
            const activity = await Activity.findById(job.attrs.data.activityId);
            const end = new Date(job.attrs.data.end);
            const now = new Date();

            if (!activity || activity.done) {
                // the activity doesn't exist anymore or it has been completed: there's nothing to do
                await jobSchedulerService.removeJob(job);
                console.error('Activity not found or already completed:', job.attrs.data.activityId);
            }
            else if (now > end) {
                // notifications have already been sent for the day: remove the job
                await jobSchedulerService.removeJob(job);
            }
            else {
                // send notifications to participants
                await sendNotificationsForActivity(activity);
            }
        }
        catch (error) {
            console.error('Failed to notify activity:', error);
        }
    });
}

// sends notifications to participants of an activity
const sendNotificationsForActivity = async (activity: IActivity) => {

    const title = `Activity ${activity.title} is late!`;
    const body = `You should have completed this activity by ${activity.deadline.toISOString().substring(0,10)}. Complete it now!`;

    for (const participant of activity.participants) {
        if (participant.status === 'accepted') {
            if (activity.notification.method.includes('email')) {
                try {
                    notificationController.sendEmailNotification(participant.email, title, body);
                }
                catch (error) {
                    console.error(`Failed to send email to ${participant.email}:`, error);
                }
            }
            if (activity.notification.method.includes('os')) {
                try {
                    const user = await findByUsername(participant.username);
                    if (user)
                        notificationController.sendPushNotification(user, { title: title, body: body });
                    else
                        console.error(`Failed to send push notification to ${participant.email}: User not found`);
                }
                catch (error) {
                    console.error(`Failed to send push notification to ${participant.email}:`, error);
                }
            }
        }
    }
}

export default {
    defineJobs,
    eventNotificationJobName,
    activityNotificationJobName,
    eventNotificationStartJobName,
    activityNotificationStartJobName
};