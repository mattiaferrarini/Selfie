import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL + '/project';

const getAllProjects = async () => {
    try {
        const response = await axios.get(`${API_URL}/all`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

export default {
    getAllProjects
}