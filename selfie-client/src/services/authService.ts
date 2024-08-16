import axios from 'axios';
import notificationService from "@/services/notificationService";

const API_URL = process.env.VUE_APP_API_URL + '/auth';

const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

const register = async (username: string, realName: string, email: string, password: string, birthday: string) => {
    try {
        const response = await axios.put(`${API_URL}/register`, { username, realName, email, password, birthday }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

const logout = async () => {
    try {
        await notificationService.unsubscribe();
        const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

export default {
    login,
    register,
    logout
};
