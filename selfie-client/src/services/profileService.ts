import axios from 'axios';
import {useAuthStore} from "@/stores/authStore";
import {Preferences} from "@/models/Preferences";

const API_URL = process.env.VUE_APP_API_URL + '/profile';

const changePassword = async (old_password: string, new_password: string) => {
    try {
        await axios.post(`${API_URL}/change-password`, {old_password, new_password}, {withCredentials: true});
    } catch (error: any) {
        throw error.response.data;
    }
};

const updatePreferences = async (preferences: Partial<Preferences>) => {
    try {
        const response= await axios.post(`${API_URL}/preferences`, preferences, {withCredentials: true});
        const authStore = useAuthStore();
        authStore.setPreferences(response.data.preferences);
    } catch (error: any) {
        throw error.response.data;
    }
};

const changeRealName = async (realName: string) => {
    try {
        await axios.post(`${API_URL}/change-realName`, {realName}, {withCredentials: true});
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

export default {
    changePassword,
    updatePreferences,
    changeRealName,
    changeBirthday
};
