import WebSocket from 'ws';
import User, { IUser } from "../models/User";
import chatController from "../controllers/chatController";
import {pushNotificationService} from "../services/pushNotificationService";

export const handleConnection = (ws: WebSocket, req: any, userConnections: Map<string, WebSocket[]>, user: IUser) => {
    const connections = userConnections.get(user.username) || [];
    connections.push(ws);
    userConnections.set(user.username, connections);

    ws.on('close', () => handleDisconnection(ws, userConnections, user));
    ws.on('message', (message: string) => handleMessage(message, ws, userConnections, user));
};

const handleDisconnection = (ws: WebSocket, userConnections: Map<string, WebSocket[]>, user: IUser) => {
    const connections = userConnections.get(user.username) || [];
    const index = connections.indexOf(ws);
    if (index > -1) {
        connections.splice(index, 1);
    }
    if (connections.length === 0) {
        userConnections.delete(user.username);
    } else {
        userConnections.set(user.username, connections);
    }
};

const handleMessage = (message: string, ws: WebSocket, userConnections: Map<string, WebSocket[]>, user: IUser) => {
    try {
        const parsedMessage = JSON.parse(message);
        chatController.sendMessage(user.username, parsedMessage.to, parsedMessage.text).then(() => {
            const connections = userConnections.get(parsedMessage.to);
            // TODO: email?
            if (connections) {
                connections.forEach((cws) => cws.send(JSON.stringify({
                    from: user.username,
                    text: parsedMessage.text
                })));
            }
            User.findOne({username: parsedMessage.to}).then((user: any) => {
                user?.pushSubscriptions.forEach((pushSubscription: any) => {
                    pushNotificationService.sendNotification(pushSubscription, {title: user.username, body: parsedMessage.text});
                });
            });
        }).catch((err) => ws.send('Error sending message', err));
    } catch (error) {
        ws.send('Error parsing message');
    }
};