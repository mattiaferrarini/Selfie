import axios from 'axios';
import { Activity } from '@/models/Activity';

const API_URL = process.env.VUE_APP_API_URL + '/activity'; // Change this URL to match your backend API

const getActivitiesByUser = async (username: string) => {
    try {
        const response = await axios.get(`${API_URL}/user/${username}`, { withCredentials: true });
        const transformedData = response.data.map((activity: any) => formatActivity(activity));
        return transformedData;
    } catch (error: any) {
        console.log(error);
        throw error.response.data;
    }
};

const addActivity = async (activity: Activity) => {
    try {
        const response = await axios.post(`${API_URL}`, activity, { withCredentials: true });
        return formatActivity(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
};

const modifyActivity = async (activity: Activity) => {
    try {
        const response = await axios.put(`${API_URL}/${activity.id}`, activity, { withCredentials: true });
        return formatActivity(response.data);
    } catch (error: any) {
        throw error.response.data;
    }
};

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
};

export default {
    getActivitiesByUser,
    addActivity,
    modifyActivity,
    deleteActivity
};