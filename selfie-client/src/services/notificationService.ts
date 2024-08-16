import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL + '/notification';

const subscribe = async () => {
    try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            console.log("Registering service worker...");
            registration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
            });
            console.log("Service Worker Registered...");
        }

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            console.log("Registering Push...");
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.VUE_PUBLIC_VAPID_KEY || ''),
            });
            console.log("Push Registered...");
        }

        console.log("Sending Push...");
        const response = await axios.post(`${API_URL}/subscribe`, subscription, { withCredentials: true });
        console.log("Push Sent...");
        return response.data;
    } catch (error: any) {
        console.log(error);
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

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default {
    subscribe,
    unsubscribe
}