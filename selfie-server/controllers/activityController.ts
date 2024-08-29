import Activity from "../models/Activity";
import timeService from "../services/timeService";
import * as inviteController from './inviteController';
import jobSchedulerService from "../services/jobSchedulerService";

const formatActivity = (activity: any) => {
    return {
        id: activity._id,
        title: activity.title,
        done: activity.done,
        deadline: activity.deadline,
        notification: activity.notification,
        participants: activity.participants,
        subActivitiesIDs: activity.subActivitiesIDs,
        pomodoro: activity.pomodoro
    };
}

export const getActivitiesByUser = async (req: any, res: any) => {
    const {username} = req.params;
    const {start, end} = req.query;

    try {
        let activities = await Activity.find({
            participants: {
                $elemMatch: {
                    username: username,
                    status: 'accepted'
                }
            }
        });

        if (start && end) {
            // filter activities whose deadline is in the selected period of time
            // or activities that are not done and whose deadline is before the selected period of time
            activities = activities.filter((activity: any) => {
                return timeService.inRange(activity.deadline, new Date(start), new Date(end)) ||
                    (!activity.done && activity.deadline < timeService.getStartOfDay(new Date(start)));
            });
        }

        const formattedActivities = activities.map((activity: any) => formatActivity(activity));
        res.status(200).send(formattedActivities);
    } catch (error) {
        res.status(500).send({error: 'Error retrieving activities'});
    }
}

export const getPomodoroStats = async (req: any, res: any) => {
    try {
        const completedActivities = await Activity.find({
            "participants.username": req.user.username,
            done: true,
            pomodoro: {$ne: {}, $exists: true}
        });
        const missingActivities = await Activity.find({
            "participants.username": req.user.username,
            done: false,
            pomodoro: {$ne: {}, $exists: true},
            deadline: {$lt: new Date()}
        }).sort({deadline: 1});
        res.status(200).json({
            completed: completedActivities.length,
            completedCycles: completedActivities.reduce((acc, activity) => acc + (activity.pomodoro?.completedCycles.get(req.user.username) || 0), 0),
            missing: missingActivities.length,
            missingTotalCycles: missingActivities.reduce((acc, activity) => acc + (activity.pomodoro?.options.numberOfCycles || 0), 0),
            missingCompletedCycles: missingActivities.reduce((acc, activity) => acc + (activity.pomodoro?.completedCycles.get(req.user.username) || 0), 0),
            oldestActivityId: missingActivities[0]?._id || ''
        });
    } catch (error) {
        res.status(500).send({error: 'Error retrieving activities'});
    }
}

export const getActivityById = async (req: any, res: any) => {
    const {id} = req.params;
    try {
        const activity = await Activity.findById(id);
        res.status(200).send(formatActivity(activity));
    } catch (error) {
        res.status(404).send({error: "Activity doesn't exist!"});
    }
}

export const deleteActivity = async (req: any, res: any) => {
    const {id} = req.params;
    try {
        await recursiveDeleteActivity(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).send({error: "Activity doesn't exist!"});
    }
}

const recursiveDeleteActivity = async (id: string) => {
    const activity = await Activity.findById(id);

        if(activity){
            await Promise.all(activity.subActivitiesIDs.map(async (subActivityID: string) => {
                recursiveDeleteActivity(subActivityID);
            }));

            await jobSchedulerService.clearActivityNotifications(activity);
            await Activity.findByIdAndDelete(id);
            await inviteController.deleteActivityInvites(id);
        }
    }

export const addActivity = async (req: any, res: any) => {
    const newActivity = new Activity({
        title: req.body.title,
        done: req.body.done,
        deadline: req.body.deadline,
        notification: req.body.notification,
        participants: req.body.participants,
        subActivitiesIDs: req.body.subActivitiesIDs,
        pomodoro: req.body.pomodoro
    });

    try {
        if (newActivity.pomodoro && newActivity.pomodoro.completedCycles) {
            const completedCycles = newActivity.pomodoro.completedCycles;
            const participants = newActivity.participants.map((participant: any) => participant.username);

            participants.forEach(username => {
                if (username !== req.user.username)
                    completedCycles.set(username, 0);
            });

            newActivity.pomodoro.completedCycles = completedCycles;
        }
        await newActivity.save();
        await inviteController.createInvitesForActivity(newActivity);
        await jobSchedulerService.scheduleActivityNotification(newActivity);
        res.status(201).send(formatActivity(newActivity));
    } catch (error) {
        res.status(400).send({error: 'Error adding activity'});
    }
}

export const modifyActivity = async (req: any, res: any) => {
    const {id} = req.params;
    try {
        const activity = await Activity.findById(id);
        if (activity) {
            const participantUsernames = req.body.participants?.map((participant: any) => participant.username);
            const removedParticipants = req.body.participants ? activity.participants.filter((participant: any) => !participantUsernames.includes(participant.username)) : [];
            const removedUsernames = removedParticipants.map((participant: any) => participant.username);

            if (req.body.pomodoro && req.body.pomodoro.completedCycles) {
                if (!activity.pomodoro)
                    activity.pomodoro = {options: req.body.pomodoro.options, completedCycles: new Map<string,number>()};
                activity.pomodoro.options = req.body.pomodoro.options;

                Object.entries(req.body.pomodoro.completedCycles).map((object: any) => {
                    activity.pomodoro?.completedCycles.set(object[0], object[1]);
                });

                participantUsernames?.forEach((username: string) => {
                    if (!activity.pomodoro?.completedCycles.has(username))
                        activity.pomodoro?.completedCycles.set(username, 0);
                })

                removedUsernames?.forEach(username => {
                    activity.pomodoro?.completedCycles.delete(username);
                });
            }

            req.body.pomodoro?.completedCycles && delete req.body.pomodoro;
            Object.assign(activity, req.body);
            activity.save();

            await inviteController.createInvitesForActivity(activity);
            await inviteController.deleteActivityParticipantsInvites(id, removedUsernames);
            await jobSchedulerService.updateLateActivityNotification(activity);

            // TODO: remove deleted subactivities from participants

            res.status(200).send(formatActivity(activity));
        } else {
            res.status(404).send({error: "Activity doesn't exist!"});
        }
    } catch (error) {
        res.status(404).send({error: "Activity doesn't exist!"});
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
            activity.save();
        } else {
            throw new Error("Activity doesn't exist!");
        }
    } catch (error) {
        throw new Error("Error changing participant status");
    }
}