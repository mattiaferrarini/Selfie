import axios from 'axios';
import {CalendarOptions, GoogleCalendar, ICalendar, ICSAlarm, OutlookCalendar, YahooCalendar} from "datebook";
import CalendarAttendee from "datebook/dist/src/types/CalendarAttendee";
import {CalendarEvent} from '@/models/Event';
import {useAuthStore} from '@/stores/authStore';
import userService from './userService';

const API_URL = process.env.VUE_APP_API_URL + '/event';

const getEventsByUser = async (username: string, start?: Date, end?: Date) => {
    try {
        let url = `${API_URL}/user/${username}`;
        if (start && end) {
            url += `?start=${start.toISOString()}&end=${end.toISOString()}`;
        }
        const response = await axios.get(url, {withCredentials: true});
        return response.data.map((event: any) => formatEvent(event));
    } catch (error: any) {
        throw error.response.data;
    }
}

const getEventById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {withCredentials: true});
        return formatEvent(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const addEvent = async (event: CalendarEvent) => {
    try {
        const response = await axios.put(`${API_URL}`, event, {withCredentials: true});
        return formatEvent(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const modifyEvent = async (event: CalendarEvent) => {
    try {
        const response = await axios.post(`${API_URL}/${event.id}`, event, {withCredentials: true});
        return formatEvent(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const deleteEvent = async (event: CalendarEvent) => {
    try {
        await axios.delete(`${API_URL}/${event.id}`, {withCredentials: true});
    } catch (error: any) {
        throw error.response.data;
    }
}

const formatEvent = (event: any) => {
    return {
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        repetition: {
            ...event.repetition,
            endDate: new Date(event.repetition.endDate)
        }
    }
}

const generateOptionsForEvent = (event: CalendarEvent): CalendarOptions => {

    const attendees: CalendarAttendee[] = event.participants.map(participant => {
        return {
            name: participant.username,
            email: participant.email
        };
    });

    const recurrence = {
        frequency: event.repetition.frequency.toUpperCase(),
        interval: 1,
        count: event.repetition.until == 'n-reps' ? event.repetition.numberOfRepetitions : undefined,
        end: event.repetition.until == 'date' ? new Date(event.repetition.endDate) : undefined
    };

    return {
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        location: event.location,
        attendees: attendees,
        recurrence: event.repetition.frequency !== 'never' ? recurrence : undefined
    };
}

const generateAlarmsForEvent = (event: CalendarEvent): ICSAlarm[] => {
    const alarms: ICSAlarm[] = [];

    if(event.notification.method.length > 0){
        let whenMinutes = stringToMinutes(event.notification.when);
        const repeatFrequencyMinutes = stringToMinutes(event.notification.repeat);

        while(whenMinutes >= 0){
            const newAlarm: ICSAlarm = {
                action: 'METHOD',
                summary: 'Reminder of ' + event.title,
                description: event.title + ' is starting soon!',
                trigger: {
                    minutes: whenMinutes
                },
            };

            if(event.notification.method.includes('email')){
                newAlarm.action = 'EMAIL';
                alarms.push(newAlarm);
            }
            if(event.notification.method.includes('push')){
                newAlarm.action = 'DISPLAY';
                alarms.push(newAlarm);
            }

            whenMinutes -= repeatFrequencyMinutes;
        }
    }
    return alarms;
}

// converts a string representing a time amount to the corresponding number of minutes
const stringToMinutes = (str: string) => {
    const parts = str.split(' ');

    if(parts.length !== 2)
        return 0;
    else{
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
}

const convertOptionsToICalendar = (options: CalendarOptions, alarms: ICSAlarm[]): string => {
    const iCal = new ICalendar(options);
    for(const alarm of alarms){
        iCal.addAlarm(alarm);
    }
    return iCal.render();
}

const convertOptionsToYahoo = (options: CalendarOptions): string => {
    return new YahooCalendar(options).render();
}

const convertOptionsToGoogle = (options: CalendarOptions): string => {
    return new GoogleCalendar(options).render();
}

const convertOptionsToOutlook = (options: CalendarOptions): string => {
    return new OutlookCalendar(options).render();
}

const convertICalendarToEvent = async (icalStr: string): Promise<CalendarEvent> => {
    const data = await getEventFromIcal(icalStr);

    const event = new CalendarEvent();

    for (const k in data) {
        const ev = data[k];

        if (Object.prototype.hasOwnProperty.call(data, k) && ev.type == 'VEVENT') {
            // general info
            event.title = ev.summary;
            event.location = ev.location;
            event.start = new Date(ev.start);
            event.end = new Date(ev.end);

            // participants
            if (ev.attendee) {
                if (Array.isArray(ev.attendee)) {
                    event.participants = ev.attendee.map(formatICAttendee);
                } else if (typeof ev.attendee === 'object') {
                    event.participants = [formatICAttendee(ev.attendee)];
                }
            }

            // remove participants that do not have an account
            event.participants = await Promise.all(event.participants.filter(async participant => !await userService.getUserBasicInfo(participant.username)));

            // repetition
            if (ev.rrule) {
                const recRule = getRecurrenceRule(icalStr);

                if (recRule.freq)
                    event.repetition.frequency = recRule.freq;

                if (recRule.count) {
                    event.repetition.until = 'n-reps';
                    event.repetition.numberOfRepetitions = parseInt(recRule.count);
                } else if (recRule.until) {
                    event.repetition.until = 'date';
                    event.repetition.endDate = new Date(ev.rrule.options.until);
                }
            }
            break;
        }
    }
    return event;
}

const getEventFromIcal = async (icalStr: string): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/import`, {icalStr}, {withCredentials: true});
        return response.data;
    }
    catch (error: any) {
        throw error.response.data;
    }
}

const getRecurrenceRule = (icalStr: string) => {
    const rule: any = {};
    const lines = icalStr.split('\n');
    for (const line of lines) {
        if (line.startsWith('RRULE:')) {
            const rruleStr = line.substring(6);
            const options = rruleStr.split(';');
            for (const option of options) {
                const [key, value] = option.split('=');
                rule[key.toLowerCase()] = value.toLowerCase();
            }
            break;
        }
    }
    return rule;
}

const formatICAttendee = (attendee: any) => {
    const authStore = useAuthStore();
    const mailtoPrefix = "MAILTO:";

    if (attendee.val.startsWith(mailtoPrefix)) {
        attendee.val = attendee.val.substring(mailtoPrefix.length);
    }

    return {
        username: attendee.params.CN,
        email: attendee.val,
        status: attendee.val === authStore.user.email ? 'accepted' : 'pending'
    };
}

const sendExportViaEmail = async (formData: FormData) => {
    try {
        const response = await axios.post(`${API_URL}/export`, formData, {withCredentials: true});
        return response.data;
    } catch (error: any) {
        return "Error sending the email. Please try again later.";
    }
}

const removeParticipantFromEvent = async (event: CalendarEvent, username: string) => {
    try {
        await axios.post(`${API_URL}/removeParticipant/${event.id}`, {}, { withCredentials: true });
    }
    catch (error: any) {
        return;
    }
}

export default {
    getEventsByUser,
    getEventById,
    addEvent,
    modifyEvent,
    deleteEvent,
    generateOptionsForEvent,
    convertOptionsToICalendar,
    convertOptionsToYahoo,
    convertOptionsToGoogle,
    convertOptionsToOutlook,
    convertICalendarToEvent,
    getEventFromIcal,
    sendExportViaEmail,
    removeParticipantFromEvent,
    generateAlarmsForEvent
};