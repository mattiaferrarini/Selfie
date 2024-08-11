import Activity from "../models/Activity";

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
        subActivitiesIDs: req.body.subActivitiesIDs,
        pomodoro: req.body.pomodoro
    });

    try {
        await newActivity.save();
        res.status(201).send(formatActivity(newActivity));
    } catch (error) {
        res.status(400).send({ error: 'Error adding activity' });
    }
}

export const modifyActivity = async (req: any, res: any) => {
    const { id } = req.params;
    const { title, done, deadline, notification, participants, pomodoro } = req.body;
    try {
        const updatedActivity = await Activity.findByIdAndUpdate(id, { title, done, deadline, notification, participants, pomodoro }, { new: true });
        res.status(200).send(formatActivity(updatedActivity));
    } catch (error) {
        res.status(404).send({ error: "Activity doesn't exist!" });
    }
}