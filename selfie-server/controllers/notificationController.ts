import User, {IUser} from "../models/User";
import {pushNotificationService} from "../services/pushNotificationService";
import {sendEmail} from "../services/mailerService";

const subscribe = async (req: any, res: any) => {
    // Get pushSubscription object
    const subscription = req.body;
    const userId = req.user?._id;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).send('User not found');

        // Check if the subscription already exists
        const existingSubscriptionIndex = user.pushSubscriptions.findIndex(sub => sub.endpoint === subscription.endpoint);
        if (existingSubscriptionIndex === -1) {
            // Add new subscription if it doesn't exist
            user.pushSubscriptions.push(subscription);
        } else {
            // Update existing subscription
            user.pushSubscriptions[existingSubscriptionIndex] = subscription;
        }

        await user.save();
        res.status(200).send('Subscription added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending push notification');
    }
}

const unsubscribe = async (req: any, res: any) => {
    const {endpoint} = req.body;
    const userId = req.user?._id;

    try {
        await User.findByIdAndUpdate(userId, {$pull: {pushSubscriptions: {endpoint}}});
        res.status(200).json({message: "Subscription removed successfully."});
    } catch (error) {
        console.error("Error removing subscription:", error);
        res.status(500).json({message: "Failed to remove subscription."});
    }
}

const sendNotificationToUsername = async (username: string, payload: any) => {
    const user = await User.findOne({username: username});
    if (user)
        sendNotification(user, payload);
}

const sendNotification = async (user: IUser, payload: any) => {
    if (user.preferences.notificationType === "push" || user.preferences.notificationType === "both")
        user.pushSubscriptions.forEach((pushSubscription: any) => pushNotificationService.sendNotification(pushSubscription, payload));
    if (user.preferences.notificationType === "email" || user.preferences.notificationType === "both")
        await sendEmail(user.email, payload.title, payload.body);
}

const sendPushNotification = async (user: IUser, payload: any) => {
    user.pushSubscriptions.forEach((pushSubscription: any) => pushNotificationService.sendNotification(pushSubscription, payload));
}

const sendEmailNotification = async (to: string, subject: string, body: string) => {
    try {
        await sendEmail(to, subject, body);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

export default {
    subscribe,
    unsubscribe,
    sendNotificationToUsername,
    sendNotification,
    sendPushNotification,
    sendEmailNotification
}