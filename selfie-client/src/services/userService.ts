
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL + '/user';

const getUserNames = async () => {
    try {
        const response = await axios.get(`${API_URL}/usernames`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

const getUserBasicInfo = async (username: string) => {
    try {
        const response = await axios.get(`${API_URL}/info/${username}`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return null;
    }
}

export default {
    getUserNames,
    getUserBasicInfo,
}