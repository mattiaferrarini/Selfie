import axios from 'axios';
import { Activity } from '@/models/Activity';
import eventService from './eventService';
import timeService from './timeService';

const API_URL = process.env.VUE_APP_API_URL + '/activity'; // Change this URL to match your backend API

const getActivitiesByUser = async (username: string, start?: Date, end?: Date) => {
    try {
        let url = `${API_URL}/user/${username}`;
        if (start && end) {
            url += `?start=${start.toISOString()}&end=${end.toISOString()}`;
        }
        const response = await axios.get(url, { withCredentials: true });
        const transformedData = response.data.map((activity: any) => formatActivity(activity));
        return transformedData;
    } catch (error: any) {
        throw error.response.data;
    }
}

const getActivityById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
        return formatActivity(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const addActivity = async (activity: Activity) => {
    try {
        const response = await axios.post(`${API_URL}`, activity, { withCredentials: true });
        return formatActivity(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const modifyActivity = async (activity: Activity) => {
    try {
        const response = await axios.put(`${API_URL}/${activity.id}`, activity, { withCredentials: true });
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
        deadline: new Date(activity.deadline)
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

export default {
    getActivitiesByUser,
    getActivityById,
    addActivity,
    modifyActivity,
    deleteActivity,
    convertICalendarToActivity
}