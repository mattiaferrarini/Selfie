import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL + '/note'; // Change this URL to match your backend API


const getall = async () => {
    try {
        const response = await axios.get(`${API_URL}/`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

const getid = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

const create = async (content: string, title: string, creation: string, lastmodify: string) => {
    try {
        const response = await axios.post(`${API_URL}/`, { content, title, creation, lastmodify }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

const modify = async (id: string, content: string, title: Date, lastmodify: Date) => {
    try {
        const response = await axios.put(`${API_URL}/`, { id, content, title, lastmodify }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

const remove = async (id: string) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

export default {
    getall,
    getid,
    create,
    modify,
    remove
};