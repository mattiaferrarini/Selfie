import Invite, { IInvite } from "../models/Invite";
import * as eventController from "./eventController";
import * as activityController from "./activityController";
import timeService from "../services/timeService";
import Event, { IEvent } from "../models/Event";
import Activity, { IActivity } from "../models/Activity";
import * as resourceController from "./resourceController";
import * as unavailabilityController from "./unavailabilityController";
import notificationController from "./notificationController";
import { getUserByUsername } from "./userController";

const formatInvite = (invite: IInvite) => {
    return {
        id: invite._id,
        inviteeUsername: invite.inviteeUsername,
        eventId: invite?.eventId,
        activityId: invite?.activityId,
        answerDate: invite.answerDate
    }
}

export const getPendingInvitesByUser = async (req: any, res: any) => {
    const { username } = req.params;
    const { date } = req.query;

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

export const createInvitesForEvent = async (event: IEvent) => {
    const participants = event.participants;
    const answerDate = new Date(); // TODO: change to current date
    const eventId = event._id as string;

    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        try {
            if (participant.status === 'pending') {
                if (await resourceController.isResource(participant.username)) {
                    if (!await eventController.otherEventsOverlap(participant.username, event))
                        participant.status = 'accepted';
                    else if (!await inviteAlreadyExists(participant.username, eventId))
                        await addInvite(participant.username, answerDate, event.title, [event.owner], eventId);
                }
                else { // user
                    if (!await unavailabilityController.isUserFreeForEvent(participant.username, event))
                        participant.status = 'declined';
                    else if (!await inviteAlreadyExists(participant.username, eventId))
                        await addInvite(participant.username, answerDate, event.title, [event.owner], eventId);
                }
            }
            await event.save();
        }
        catch {
            console.log("Error creating invite");
        }
    }
}

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

export const inviteAlreadyExists = async (inviteeUsername: string, eventId?: string, activityId?: string) => {
    try {
        const invite = await Invite.findOne({ inviteeUsername: inviteeUsername, eventId: eventId, activityId: activityId });
        return invite;
    } catch (error) {
        throw new Error("Error checking if invite exists");
    }
}

export const deleteEventInvites = async (eventId: string,) => {
    try {
        await Invite.deleteMany({ eventId: eventId });
    } catch (error) {
        throw new Error("Error deleting event invites");
    }
}

export const deleteActivityInvites = async (activityId: string) => {
    try {
        await Invite.deleteMany({ activityId: activityId });
    } catch (error) {
        throw new Error("Error deleting activity invites");
    }
}

export const deleteEventParticipantsInvites = async (eventId: string, usernames: string[]) => {
    try {
        await Invite.deleteMany({ eventId: eventId, inviteeUsername: { $in: usernames } });
    } catch (error) {
        throw new Error("Error deleting event invites");
    }
}

export const deleteActivityParticipantsInvites = async (activityId: string, usernames: string[]) => {
    try {
        await Invite.deleteMany({ activityId: activityId, inviteeUsername: { $in: usernames } });
    } catch (error) {
        throw new Error("Error deleting activity invites");
    }
}

export const deleteInvite = async (id: string) => {
    try {
        await Invite.findByIdAndDelete(id);
    } catch (error) {
        throw new Error("Error deleting invite");
    }
}

export const acceptInvite = async (req: any, res: any) => {
    await actOnInvite(req, res, 'accepted');
}

export const declineInvite = async (req: any, res: any) => {
    await actOnInvite(req, res, 'declined');
}

export const postponeInvite = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const invite = await Invite.findById(id);
        if (invite) {
            invite.answerDate = timeService.moveAheadByDays(invite.answerDate, 1);
            await invite.save();
            res.status(200).send(formatInvite(invite));
        }
        else {
            res.status(404).send({ error: "Invite doesn't exist!" });
        }
    }
    catch (error) {
        res.status(500).send({ error: 'Error postponing invite' });
    }
}

const actOnInvite = async (req: any, res: any, response: string) => {
    const { id } = req.params;

    try {
        const invite = await Invite.findById(id);
        if (invite) {

            let inviters = [];
            let title = '';

            if (invite.eventId) {
                await eventController.changeParticipantStatus(invite.eventId as string, invite.inviteeUsername, response);
                const event = await Event.findById(invite.eventId);
                if(event){
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
            res.status(404).send({ error: "Invite doesn't exist!" });
        }
    }
    catch (error) {
        res.status(500).send({ error: 'Error acting on invite' });
    }
}