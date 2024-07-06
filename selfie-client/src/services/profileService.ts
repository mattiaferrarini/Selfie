import axios from 'axios';
import {useAuthStore} from "@/stores/authStore";
import router from "@/router";

const API_URL = process.env.VUE_APP_API_URL + '/profile'; // Change this URL to match your backend API

const changePassword = async (old_password: string, new_password: string) => {
    try {
        await axios.post(`${API_URL}/change-password`, {old_password, new_password}, {withCredentials: true});
    } catch (error: any) {
        if (401 === error.response.status) {
            const authStore = useAuthStore();
            authStore.clearAuthData();
            await router.push({name: "login", params: {message: "Your session has expired. Please login again."}});
        }
        throw error.response.data;
    }
};

export default {
    changePassword,
};
