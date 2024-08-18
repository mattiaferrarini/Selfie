import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL + '/note';


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

const create = async (content: string, title: string, creation: string, lastmodify: string, category: string) => {
    try {
        const response = await axios.post(`${API_URL}/`, { content, title, creation, lastmodify, category }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

const modify = async (id: string, title: string, content: string, lastmodify: Date, category: string, owners: [string], todoList: [any]) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, { content, title, lastmodify, category, owners, todoList }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

const remove = async (id: string) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`,{ withCredentials: true });
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