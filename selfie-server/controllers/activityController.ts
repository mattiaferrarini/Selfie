import Activity from "../models/Activity";
import * as inviteController from './inviteController';

const formatActivity = (activity: any) => {
    return {
        id: activity._id,
        title: activity.title,
        done: activity.done,
        deadline: activity.deadline,
        notification: activity.notification,
        participants: activity.participants,
        subActivitiesIDs: activity.subActivitiesIDs
    };
}

export const getActivitiesByUser = async (req: any, res: any) => {
    const { username } = req.params;
    try {
        const activities = await Activity.find({ "participants.username": username });
        const formattedActivities = activities.map((activity: any) => formatActivity(activity));
        res.status(200).send(formattedActivities);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving activities' });
    }
}

export const getActivityById = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const activity = await Activity.findById(id);
        res.status(200).send(formatActivity(activity));
    } catch (error) {
        res.status(404).send({ error: "Activity doesn't exist!" });
    }
}

export const deleteActivity = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await Activity.findByIdAndDelete(id);
        await inviteController.deleteActivityInvites(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).send({ error: "Activity doesn't exist!" });
    }
}

export const addActivity = async (req: any, res: any) => {
    const newActivity = new Activity({
        title: req.body.title,
        done: req.body.done,
        deadline: req.body.deadline,
        notification: req.body.notification,
        participants: req.body.participants,
        subActivitiesIDs: req.body.subActivitiesIDs
    });

    try {
        await newActivity.save();
        await inviteController.createInvitesForActivity(newActivity);
        res.status(201).send(formatActivity(newActivity));
    } catch (error) {
        res.status(400).send({ error: 'Error adding activity' });
    }
}

export const modifyActivity = async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const activity = await Activity.findById(id);

        if (activity) {
            const removedParticipants = activity.participants.filter((participant: any) => !req.body.participants.includes(participant.username));
            const removedUsernames = removedParticipants.map((participant: any) => participant.username);

            activity.title = req.body.title;
            activity.done = req.body.done;
            activity.deadline = req.body.deadline;
            activity.notification = req.body.notification;
            activity.participants = req.body.participants;

            await activity.save();
            await inviteController.createInvitesForActivity(activity);
            await inviteController.deleteActivityParticipantsInvites(id, removedUsernames);

            res.status(200).send(formatActivity(activity));
        }
        else {
            res.status(404).send({ error: "Activity doesn't exist!" });
        }
    } catch (error) {
        res.status(404).send({ error: "Activity doesn't exist!" });
    }
}

export const changeParticipantStatus = async (id: string, username: string, newStatus: string) => {
    try {
        const activity = await Activity.findById(id);
        if (activity) {
            activity.participants.forEach((participant: any) => {
                if (participant.username === username) {
                    participant.status = newStatus;
                }
            });
        }
        else {
            throw new Error("Activity doesn't exist!");
        }
    }
    catch (error) {
        throw new Error("Error changing participant status");
    }
}