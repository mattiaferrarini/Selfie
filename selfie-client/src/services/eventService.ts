import axios from 'axios';
import { CalendarEvent } from '@/models/Event';

const API_URL = process.env.VUE_APP_API_URL + '/event'; // Change this URL to match your backend API

const getEventsByUser = async (username: string) => {
    try {
        const response = await axios.get(`${API_URL}/user/${username}`, { withCredentials: true });
        const transformedData = response.data.map((event: any) => formatEvent(event));
        return transformedData;
    } catch (error: any) {
        console.log(error);
        throw error.response.data;
    }
};

const addEvent = async (event: CalendarEvent) => {
    try {
        const response = await axios.post(`${API_URL}`, event, { withCredentials: true });
        return formatEvent(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
};

const modifyEvent = async (event: CalendarEvent) => {
    try {
        const response = await axios.put(`${API_URL}/${event.id}`, event, { withCredentials: true });
        return formatEvent(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
};

const deleteEvent = async (event: CalendarEvent) => {
    try {
        await axios.delete(`${API_URL}/${event.id}`, { withCredentials: true });
    } catch (error: any) {
        throw error.response.data;
    }
}

const formatEvent = (event: any) => {
    return {
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
    }
};

export default {
    getEventsByUser,
    addEvent,
    modifyEvent,
    deleteEvent
};