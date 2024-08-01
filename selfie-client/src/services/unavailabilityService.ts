import axios from 'axios';
import { Unavailability } from '@/models/Unavailability';

const API_URL = process.env.VUE_APP_API_URL + '/unavailability'; // Change this URL to match your backend API

const getUnavailabilitiesByUser = async (username: string) => {
    try {
        const response = await axios.get(`${API_URL}/user/${username}`, { withCredentials: true });
        const transformedData = response.data.map((unavailability: any) => formatUnavailability(unavailability));
        return transformedData;
    } catch (error: any) {
        console.log(error);
        throw error.response.data;
    }
};

const addUnavailability = async (unavailability: Unavailability) => {
    try {
        const response = await axios.post(`${API_URL}`, unavailability, { withCredentials: true });
        return formatUnavailability(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
};

const modifyUnavailability = async (unavailability: Unavailability) => {
    try {
        const response = await axios.put(`${API_URL}/${unavailability.id}`, unavailability, { withCredentials: true });
        return formatUnavailability(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
};

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
        end: new Date(unavailability.end)
    }
};

export default {
    getUnavailabilitiesByUser,
    addUnavailability,
    modifyUnavailability,
    deleteUnavailability
};