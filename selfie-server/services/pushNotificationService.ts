import PushNotifications, {Settings} from "node-pushnotifications";
import dotenv from "dotenv";

const path = require('path');
const dotenv_path = path.join(__dirname, '../.env.local');
dotenv.config({path: dotenv_path});

class PushNotificationService {
    private pushService: PushNotifications;

    constructor() {
        const settings: Settings = {
            web: {
                vapidDetails: {
                    subject: "mailto:help@selfie.it",
                    publicKey: process.env.PUBLIC_VAPID_KEY || '',
                    privateKey: process.env.PRIVATE_VAPID_KEY || '',
                },
                gcmAPIKey: "gcmkey",
                TTL: 2419200,
                contentEncoding: "aes128gcm",
                headers: {},
            },
            isAlwaysUseFCM: false,
        };

        this.pushService = new PushNotifications(settings);
    }

    public sendNotification(subscription: any, payload: any): void {
        this.pushService.send(subscription, payload);
    }
}

// Export an instance of the service for use throughout your application
export const pushNotificationService = new PushNotificationService();