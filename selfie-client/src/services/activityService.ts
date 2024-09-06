import axios from 'axios';
import { Activity } from '@/models/Activity';
import eventService from './eventService';
import timeService from './timeService';

const API_URL = process.env.VUE_APP_API_URL + '/activity';

const getActivitiesByUser = async (username: string, start?: Date, end?: Date) => {
    try {
        let url = `${API_URL}/user/${username}`;
        if (start && end) {
            url += `?start=${start.toISOString()}&end=${end.toISOString()}`;
        }
        const response = await axios.get(url, { withCredentials: true });
        return response.data.map((activity: any) => formatActivity(activity));
    } catch (error: any) {
        throw error.response.data;
    }
}

const getPomodoroStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/pomodoro/stats`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

const getActivityById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
        return formatActivity(response.data);
    } catch (error: any) {
        return null;
    }
}

const addActivity = async (activity: Activity) => {
    try {
        const response = await axios.put(`${API_URL}`, activity, { withCredentials: true });
        return formatActivity(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const modifyActivity = async (activity: Partial<Activity>) => {
    try {
        const response = await axios.post(`${API_URL}/${activity.id}`, activity, { withCredentials: true });
        return formatActivity(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const deleteActivity = async (activity: Activity) => {
    try {
        await axios.delete(`${API_URL}/${activity.id}`, { withCredentials: true });
    } catch (error: any) {
        throw error.response.data;
    }
}

const formatActivity = (activity: any) => {
    return {
        ...activity,
        deadline: new Date(activity.deadline),
        start: activity.start ? new Date(activity.start) : undefined,
    }
}

const convertICalendarToActivity = async (icalStr: string) : Promise<Activity> => {
    const event = await eventService.convertICalendarToEvent(icalStr);
    const activity = new Activity();
    activity.title = event.title;
    activity.deadline = timeService.getEndOfDay(event.end);
    activity.participants = event.participants;

    return activity;
}

const removeParticipantFromActivity = async (activity: Activity, username: string) => {
    try {
        await axios.post(`${API_URL}/removeParticipant/${activity.id}`, {}, { withCredentials: true });
    }
    catch (error: any) {
        return;
    }
}

export default {
    getActivitiesByUser,
    getPomodoroStats,
    getActivityById,
    addActivity,
    modifyActivity,
    deleteActivity,
    convertICalendarToActivity,
    removeParticipantFromActivity
}