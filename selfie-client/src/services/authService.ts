// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/auth'; // Change this URL to match your backend API

const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

const register = async (username: string, real_name: string, email: string, password: string, birthday: string) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { username, real_name, email, password, birthday }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

const logout = async () => {
    try {
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
