import axios from "axios";
import { Resource } from "@/models/Resource";

const API_URL = process.env.VUE_APP_API_URL + '/resource';

const getAllResources = async () => {
    try {
        const response = await axios.get(`${API_URL}/all`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

const addResource = async (name: string, username: string) => {
    try {
        const response = await axios.post(API_URL, { name, username }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

const deleteResource = async (resource: Resource) => {
    try {
        await axios.delete(`${API_URL}/${resource.id}`, { withCredentials: true });
    } catch (error: any) {
        throw error.response.data;
    }
}

export default {
    getAllResources,
    addResource,
    deleteResource
}