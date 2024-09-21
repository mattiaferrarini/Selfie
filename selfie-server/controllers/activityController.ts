import Activity, {IActivity} from "../models/Activity";
import timeService from "../services/timeService";
import * as inviteController from './inviteController';
import jobSchedulerService from "../services/jobSchedulerService";
import notificationController from "./notificationController";
import _ from 'lodash';

// Format an activity for response
const formatActivity = (activity: any) => {
    return {
        id: activity._id,
        title: activity.title,
        owners: activity.owners,
        done: activity.done,
        projectId: activity.projectId,
        start: activity.start,
        deadline: activity.deadline,
        notification: activity.notification,
        participants: activity.participants,
        subActivitiesIDs: activity.subActivitiesIDs,
        pomodoro: activity.pomodoro
    };
}

// Get all accepted activities for a user
export const getActivitiesByUser = async (req: any, res: any) => {
    const {username} = req.params;
    const {start, end} = req.query;
    const authUsername = req.user.username;

    // check if the user is allowed to access the activities
    if(!authUsername || username !== authUsername)
        return res.status(403).send({error: "You are not allowed to access this user's activities!"});

    try {
        // get all activities where the user is a participant
        let activities = await Activity.find({
            participants: {
                $elemMatch: {
                    username: username,
                    status: 'accepted'
                }
            }
        });

        if (start && end) {
            // filter activities whose deadline or start is in the selected period of time
            // or activities that are not done and whose deadline is before the selected period of time
            activities = activities.filter((activity: any) => {
                return timeService.inRange(activity.deadline, new Date(start), new Date(end)) ||
                    (!activity.done && activity.deadline < timeService.getStartOfDay(new Date(start))) || 
                    (activity.start && timeService.inRange(activity.start, new Date(start), new Date(end)));
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

// Get the activity with the given ID
export const getActivityById = async (req: any, res: any) => {
    const {id} = req.params;
    const authUsername = req.user.username;

    // check if the user is allowed to access the activity
    if(!authUsername || !await accessAllowed(id, authUsername))
        return res.status(403).send({error: "You are not allowed to access this activity!"});

    try {
        const activity = await Activity.findById(id);
        res.status(200).send(formatActivity(activity));
    } catch (error) {
        res.status(404).send({error: "Activity doesn't exist!"});
    }
}

// Delete an activity
export const deleteActivity = async (req: any, res: any) => {
    const {id} = req.params;
    const authUsername = req.user.username;

    if(!authUsername || !await modificationAllowed(id, authUsername))
        return res.status(403).send({error: "You are not allowed to delete this activity!"});

    try {
        await recursiveDeleteActivity(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).send({error: "Activity doesn't exist!"});
    }
}

// Delete an activity and all its sub-activities
export const recursiveDeleteActivity = async (id: string) => {
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

// Delete an activity by ID
export const deleteActivityById = async (id: any) => {
    const activity = await Activity.findById(id);

    if (activity) {
        await jobSchedulerService.clearActivityNotifications(activity);
        await Activity.findByIdAndDelete(id);
        await inviteController.deleteActivityInvites(id);
    }
}

// Add an activity
export const addActivity = async (req: any, res: any) => {
    const newActivity = new Activity({
        title: req.body.title,
        owners: req.body.owners,
        done: req.body.done,
        start: req.body.start,
        projectId: req.body.projectId,
        deadline: req.body.deadline,
        notification: req.body.notification,
        participants: req.body.participants,
        subActivitiesIDs: req.body.subActivitiesIDs,
        pomodoro: req.body.pomodoro
    });

    try {
        await createActivity(newActivity, req);
        await inviteController.createInvitesForActivity(newActivity);
        await jobSchedulerService.scheduleActivityNotification(newActivity);
        res.status(201).send(formatActivity(newActivity));
    } catch (error) {
        res.status(400).send({error: 'Error adding activity'});
    }
}

// Create an activity
export const createActivity = async (newActivity: any, req: any) => {
    if (newActivity.pomodoro && newActivity.pomodoro.completedCycles) {
        const completedCycles = newActivity.pomodoro.completedCycles;
        const participants = newActivity.participants.map((participant: any) => participant.username);

        participants.forEach((username: string) => {
            if (username !== req.user.username)
                completedCycles.set(username, 0);
        });

        newActivity.pomodoro.completedCycles = completedCycles;
    }
    await newActivity.save();
}

// Modify an activity
export const modifyActivity = async (req: any, res: any) => {
    const {id} = req.params;
    const authUsername = req.user.username;

    // check permissions
    if(!authUsername || !(await modificationAllowed(id, authUsername) || (await accessAllowed(id, authUsername) && await onlyChangingDoneValue(id, authUsername, req.body))))
        return res.status(403).send({error: "You are not allowed to modify this activity!"});

    try {
        const activity = await Activity.findById(id);
        if (activity) {
            const originalActivity = _.cloneDeep(activity.toObject());

            const participantUsernames = req.body.participants?.map((participant: any) => participant.username);
            const removedParticipants = req.body.participants ? activity.participants.filter((participant: any) => !participantUsernames.includes(participant.username)) : [];
            const removedUsernames = removedParticipants.map((participant: any) => participant.username);

            if (req.body.pomodoro && req.body.pomodoro.completedCycles) {
                if (!activity.pomodoro)
                    activity.pomodoro = {
                        options: req.body.pomodoro.options,
                        completedCycles: new Map<string, number>()
                    };
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
            await activity.save();

            if(!_.isEqual(originalActivity, activity.toObject())){
                await inviteController.createInvitesForActivity(activity);
                await inviteController.deleteActivityParticipantsInvites(id, removedUsernames);
                notifyOfChanges(activity, authUsername);
                await jobSchedulerService.updateLateActivityNotification(activity);
            }
            res.status(200).send(formatActivity(activity));
        } else {
            res.status(404).send({error: "Activity doesn't exist!"});
        }
    } catch (error) {
        res.status(404).send({error: "Activity doesn't exist!"});
    }
}

// Notify all participants of an activity that it has been updated
const notifyOfChanges = async(activity: IActivity, committer: string) => {
    activity.participants.forEach((participant: any) => {
        if(participant.status === 'accepted' && participant.username !== committer){
            notificationController.sendNotificationToUsername(participant.username, {title: 'Activity updated', body: `Activity ${activity.title} has been updated.`});
        }
    });
}

// Change the status of a participant in an activity
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

// Remove a participant from an activity
export const removeParticipant = async (req: any, res: any) => {
    const { id } = req.params;
    const authUsername = req.user.username;

    try {
        await changeParticipantStatus(id, authUsername, 'declined');
        res.status(200).send('Participant removed');
    } catch (error) {
        res.status(500).send({ error: 'Error removing participant' });
    }
}

// Return true if the user is allowed to access the activity, false otherwise
const accessAllowed = async (activityId: string, authUsername: string) => {
    try {
        const activity = await Activity.findById(activityId);
        if(activity)
            return activity.participants.some((participant: any) => participant.username === authUsername) || activity.owners.includes(authUsername);
        else
            return false;
    }
    catch{
        return false;
    }

}

// Return true if the user is allowed to modify the activity, false otherwise
const modificationAllowed = async (activityId: string, authUsername: string) => {
    try {
        const activity = await Activity.findById(activityId);
        if(activity)
            return activity.owners.includes(authUsername);
        else
            return false;
    }
    catch{
        return false;
    }
}

// Return true if the only changing value is done, false otherwise
const onlyChangingDoneValue = async (activityId: string, authUsername: string, newActivity: any) => {
    try {
        const activity = await Activity.findById(activityId);
        if (activity) {
            const activityCopy = _.cloneDeep(activity.toObject());
            const newActivityCopy = _.cloneDeep(new Activity(newActivity).toObject());

            activityCopy.done = newActivityCopy.done;
            activityCopy._id = undefined;
            activityCopy.id = undefined;
            activityCopy.__v = undefined;
            newActivityCopy._id = undefined;
            newActivityCopy.id = undefined;
            newActivityCopy.__v = undefined;

            return _.isEqual(activityCopy, newActivityCopy);
        }
        return false;
    }
    catch {
        return false;
    }
}