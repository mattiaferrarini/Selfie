import Invite, { IInvite } from "../models/Invite";
import * as eventController from "./eventController";
import * as activityController from "./activityController";
import timeService from "../services/timeService";
import Event, { IEvent } from "../models/Event";
import Activity, { IActivity } from "../models/Activity";
import * as resourceController from "./resourceController";
import notificationController from "./notificationController";
import { getUserByUsername } from "./userController";

// Format an invite for response
const formatInvite = (invite: IInvite) => {
    return {
        id: invite._id,
        inviteeUsername: invite.inviteeUsername,
        eventId: invite?.eventId,
        activityId: invite?.activityId,
        answerDate: invite.answerDate
    }
}

// Get all pending invites for a user
export const getPendingInvitesByUser = async (req: any, res: any) => {
    const authUsername = req.user?.username;
    const authIsAdmin = req.user?.isAdmin;
    const username = req.params.username;
    const { date } = req.query;

    if (await accessAllowed(authUsername, authIsAdmin, username)) {
        try {
            let invites = await Invite.find({ inviteeUsername: username });

            if (date) {
                const cutoffDate = new Date(date);
                invites = invites.filter((invite: any) => invite.answerDate <= cutoffDate);
            }
            const formattedInvites = invites.map((invite: any) => formatInvite(invite));

            res.status(200).send(formattedInvites);
        }
        catch (error) {
            res.status(500).send({ error: 'Error getting invites' });
        }
    }
    else {
        res.status(403).send({ error: 'Access denied' });
    }
}

// Create invites for an event
export const createInvitesForEvent = async (event: IEvent) => {
    const participants = event.participants;
    const answerDate = new Date();
    const eventId = event._id as string;

    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        try {
            if (participant.status === 'pending') {
                if (await resourceController.isResource(participant.username)) {
                    if (!await inviteAlreadyExists(participant.username, eventId))
                        await addInvite(participant.username, answerDate, event.title, [event.owner], eventId);
                }
                else { // user
                    if (!await inviteAlreadyExists(participant.username, eventId))
                        await addInvite(participant.username, answerDate, event.title, [event.owner], eventId);
                }
            }
        }
        catch {
            console.log("Error creating invite");
        }
    }
}

// Create invites for an activity
export const createInvitesForActivity = async (activity: IActivity) => {
    const participants = activity.participants;
    const answerDate = new Date();
    const activityId = activity._id as string;

    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        try {
            if (participant.status === 'pending' && !await inviteAlreadyExists(participant.username, undefined, activityId)) {
                await addInvite(participant.username, answerDate, activity.title, activity.owners, undefined, activityId);
            }
        }
        catch { }
    }
}

// Create a single invite
export const addInvite = async (inviteeUsername: string, answerDate: Date, title: string, inviters: string[], eventId?: string, activityId?: string) => {
    const newInvite = new Invite({
        inviters: inviters,
        inviteeUsername: inviteeUsername,
        eventId: eventId,
        activityId: activityId,
        answerDate: answerDate
    });

    try {
        await newInvite.save();
        const user = await getUserByUsername(inviteeUsername);
        const notificationTitle = `Invite to join ${title}`;
        const body = `${inviters.join(', ')} invited you to join ${newInvite.eventId ? 'event' : 'activity'} ${title}. You can accept, decline or postpone the invite from the Calendar.`;

        if (user)
            await notificationController.sendNotification(user, { title: notificationTitle, body: body });
    }
    catch (error) {
        console.log(error);
        throw new Error("Error creating invite");
    }
}

// Check if an invite already exists
export const inviteAlreadyExists = async (inviteeUsername: string, eventId?: string, activityId?: string) => {
    try {
        const invite = await Invite.findOne({ inviteeUsername: inviteeUsername, eventId: eventId, activityId: activityId });
        return invite;
    } catch (error) {
        throw new Error("Error checking if invite exists");
    }
}

// Delete all invites for an event
export const deleteEventInvites = async (eventId: string) => {
    try {
        await Invite.deleteMany({ eventId: eventId });
    } catch (error) {
        throw new Error("Error deleting event invites");
    }
}

// Delete all invites for an activity
export const deleteActivityInvites = async (activityId: string) => {
    try {
        await Invite.deleteMany({ activityId: activityId });
    } catch (error) {
        throw new Error("Error deleting activity invites");
    }
}

// Delete all event invites for specific users
export const deleteEventParticipantsInvites = async (eventId: string, usernames: string[]) => {
    try {
        await Invite.deleteMany({ eventId: eventId, inviteeUsername: { $in: usernames } });
    } catch (error) {
        throw new Error("Error deleting event invites");
    }
}

// Delete all activity invites for specific users
export const deleteActivityParticipantsInvites = async (activityId: string, usernames: string[]) => {
    try {
        await Invite.deleteMany({ activityId: activityId, inviteeUsername: { $in: usernames } });
    } catch (error) {
        throw new Error("Error deleting activity invites");
    }
}

// Delete an invite by ID
export const deleteInvite = async (id: string) => {
    try {
        await Invite.findByIdAndDelete(id);
    } catch (error) {
        throw new Error("Error deleting invite");
    }
}

// Accept an invite
export const acceptInvite = async (req: any, res: any) => {
    await actOnInvite(req, res, 'accepted');
}

// Decline an invite
export const declineInvite = async (req: any, res: any) => {
    await actOnInvite(req, res, 'declined');
}

// Postpone an invite
export const postponeInvite = async (req: any, res: any) => {
    const { id } = req.params;
    const authUsername = req.user?.username;
    const authIsAdmin = req.user?.isAdmin;

    try {
        const invite = await Invite.findById(id);
        if (invite) {
            if (await accessAllowed(authUsername, authIsAdmin, invite.inviteeUsername)) {
                invite.answerDate = timeService.moveAheadByDays(invite.answerDate, 1);
                await invite.save();
                res.status(200).send(formatInvite(invite));
            }
            else {
                res.status(403).send({ error: 'Access denied' });
            }
        }
        else {
            res.status(404).send({ error: "Invite doesn't exist!" });
        }
    }
    catch (error) {
        res.status(500).send({ error: 'Error postponing invite' });
    }
}

// Act on an invite (accept or decline)
const actOnInvite = async (req: any, res: any, response: string) => {
    const { id } = req.params;
    const authUsername = req.user?.username;
    const authIsAdmin = req.user?.isAdmin;

    try {
        const invite = await Invite.findById(id);
        if (invite) {
            if (await accessAllowed(authUsername, authIsAdmin, invite.inviteeUsername)) {
                let inviters = [];
                let title = '';

                // change the participant status in the event/activity
                if (invite.eventId) {
                    await eventController.changeParticipantStatus(invite.eventId as string, invite.inviteeUsername, response);
                    const event = await Event.findById(invite.eventId);
                    if (event) {
                        title = event.title;
                        inviters = [event.owner];
                    }
                }
                else if (invite.activityId) {
                    await activityController.changeParticipantStatus(invite.activityId as string, invite.inviteeUsername, response);
                    const activity = await Activity.findById(invite.activityId);
                    if (activity) {
                        title = activity.title;
                        inviters = activity.owners;
                    }
                }

                // send notifications to the inviters
                for (let i = 0; i < inviters.length; i++) {
                    const inviter = invite.inviters[i];
                    const user = await getUserByUsername(inviter);
                    if (user) {
                        const notificationTitle = `${invite.inviteeUsername} ${response} your invite`;
                        const body = `${invite.inviteeUsername} ${response} your invite to join ${invite.eventId ? 'event' : 'activity'} ${title}.`;
                        await notificationController.sendNotification(user, { title: notificationTitle, body: body });
                    }
                }

                await deleteInvite(id);
                res.status(204).send();
            }
            else {
                res.status(403).send({ error: 'Access denied' });
            }
        }
        else {
            res.status(404).send({ error: "Invite doesn't exist!" });
        }
    }
    catch (error) {
        res.status(500).send({ error: 'Error acting on invite' });
    }
}

// Check if the user has access to the invite
const accessAllowed = async (authUsername: string, isAdmin: boolean, inviteeUsername: string) => {
    return authUsername === inviteeUsername || isAdmin && await resourceController.isResource(inviteeUsername);
}