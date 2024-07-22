import axios from 'axios';
import {useAuthStore} from "@/stores/authStore";

const API_URL = process.env.VUE_APP_API_URL + '/profile'; // Change this URL to match your backend API

const changePassword = async (old_password: string, new_password: string) => {
    try {
        await axios.post(`${API_URL}/change-password`, {old_password, new_password}, {withCredentials: true});
    } catch (error: any) {
        throw error.response.data;
    }
};

const changeRealName = async (real_name: string) => {
    try {
        await axios.post(`${API_URL}/change-real_name`, {real_name}, {withCredentials: true});
    } catch (error: any) {
        throw error.response.data;
    }
};

const changeBirthday = async (birthday: Date) => {
    try {
        await axios.post(`${API_URL}/change-birthday`, {birthday}, {withCredentials: true});
    } catch (error: any) {
        throw error.response.data;
    }
};

const updatePomodoroPreferences = async (workDuration: number, pauseDuration: number, numberOfCycles: number) => {
    try {
        const response= await axios.post(`${API_URL}/preferences/pomodoro`, {workDuration, pauseDuration, numberOfCycles}, {withCredentials: true});
        const authStore = useAuthStore();
        authStore.setPreferences(response.data.preferences);
    } catch (error: any) {
        throw error.response.data;
    }
}

export default {
    changePassword,
    changeRealName,
    changeBirthday,
    updatePomodoroPreferences
};
