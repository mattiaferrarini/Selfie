import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL + '/notification';

const subscribe = async () => {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        // Send Push Notification
        console.log("Sending Push...");
        const response = await axios.post(`${API_URL}/subscribe`, subscription, { withCredentials: true });
        console.log("Push Sent...");
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
};

const unsubscribe = async () => {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        await registration?.unregister();
        const response = await axios.post(`${API_URL}/unsubscribe`, { endpoint: subscription?.endpoint }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error.response.data;
    }
}

export default {
    subscribe,
    unsubscribe
}