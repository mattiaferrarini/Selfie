import axios from 'axios';
import { Unavailability } from '@/models/Unavailability';
import { CalendarEvent } from '@/models/Event';

const API_URL = process.env.VUE_APP_API_URL + '/unavailability';

const getUnavailabilitiesByUser = async (username: string, start?: Date, end?: Date) => {
    try {
        let url = `${API_URL}/user/${username}`;
        if (start && end) {
            url += `?start=${start.toISOString()}&end=${end.toISOString()}`;
        }
        const response = await axios.get(url, { withCredentials: true });
        return response.data.map((unavailability: any) => formatUnavailability(unavailability));
    } catch (error: any) {
        console.log(error);
        throw error.response.data;
    }
}

const getOverlappingUnavailabilities = async (username: string, event: CalendarEvent) => {
    try {
        const response = await axios.post(`${API_URL}/overlap/${username}`, event, { withCredentials: true });
        const transformedData = response.data.map((unavailability: any) => formatUnavailability(unavailability));
        return transformedData;
    } catch (error: any) {
        throw error.response.data;
    }
}

const addUnavailability = async (unavailability: Unavailability) => {
    try {
        const response = await axios.post(`${API_URL}`, unavailability, { withCredentials: true });
        return formatUnavailability(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const modifyUnavailability = async (unavailability: Unavailability) => {
    try {
        const response = await axios.put(`${API_URL}/${unavailability.id}`, unavailability, { withCredentials: true });
        return formatUnavailability(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
}

const deleteUnavailability = async (unavailability: Unavailability) => {
    try {
        await axios.delete(`${API_URL}/${unavailability.id}`, { withCredentials: true });
    } catch (error: any) {
        throw error.response.data;
    }
}

const formatUnavailability = (unavailability: any) => {
    return {
        ...unavailability,
        start: new Date(unavailability.start),
        end: new Date(unavailability.end),
        repetition: {
            ...unavailability.repetition,
            endDate: new Date(unavailability.repetition.endDate)
        }
    }
}

export default {
    getUnavailabilitiesByUser,
    addUnavailability,
    modifyUnavailability,
    deleteUnavailability,
    getOverlappingUnavailabilities
};