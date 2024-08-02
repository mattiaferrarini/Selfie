import PushNotifications, { Settings } from "node-pushnotifications";
import dotenv from "dotenv";
dotenv.config({ path: './.env.local' });

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
        this.pushService.send(subscription, payload, (err: any, result: any) => {
            if (err) {
                console.error(err);
            } else {
                console.log(result);
            }
        });
    }
}

// Export an instance of the service for use throughout your application
export const pushNotificationService = new PushNotificationService();