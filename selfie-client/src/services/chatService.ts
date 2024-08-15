import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL + '/chat';

const list = async () => {
    try {
        const response = await axios.get(`${API_URL}/list`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

export default {
    list
};
