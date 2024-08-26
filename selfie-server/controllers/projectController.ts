import Project, {ActivityStatus} from "../models/Project";
import User from "../models/User";
import Activity from "../models/Activity";
import notificationController from "./notificationController";
import {createActivity, deleteActivityById} from "./activityController";

export const getAllProjects = async (req: any, res: any) => {
    const username = req.user.username;

    try {
        const projects = await Project.find({
            $or: [
                {owner: username},
                {actors: username}
            ]
        });
        res.status(200).send(projects);
    } catch (error) {
        res.status(404).send({error: 'No projects found'});
    }
}

export const deleteProject = async (req: any, res: any) => {
    const {id} = req.params;
    try {
        // delete all the activities of the project
        const project = await Project.findById(id);
        if (project) {
            project.phases.map((phase: any) => {
                phase.activities.map(async (activity: any) => {
                    await Activity.findByIdAndDelete(activity.activityId);
                });
            });
        }
        await Project.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).send({error: "Project doesn't exist!"});
    }
}

const deleteAllActivities = async (project: any) => {
    project.phases.map((phase: any) => {
        phase.activities.map(async (activity: any) => {
            await deleteActivityById(activity.activityId);
        });
    });
}

const createActivities = async (phases: any, req: any, res: any): Promise<boolean> => {
    const createdActivitiesIds: string[] = [];

    for (const phase of phases) {
        for (const activity of phase.activities) {
            try {
                const createdActivity = new Activity(activity);
                await createActivity(createdActivity, req);
                createdActivitiesIds.push(createdActivity._id as string);
                activity.activityId = createdActivity._id;

                if (activity.linkedActivityId) {
                    const linkedActivity = phase.activities.find((act: any) => act.localId === activity.linkedActivityId);

                    if (!linkedActivity) {
                        throw new Error('Linked activity does not exist');
                    } else if (linkedActivity === activity) {
                        throw new Error('An activity cannot be linked to itself');
                    }
                }
            } catch (error) {
                // delete all activities created so far
                for (const activityId of createdActivitiesIds) {
                    await deleteActivityById(activityId);
                }
                res.status(400).send({error: 'Error creating activity'});
                return false;
            }
        }
    }
    return true;
};

export const modifyStatus = async (req: any, res: any) => {
    const {id} = req.params;
    const {status, activityId} = req.body;

    if (!ActivityStatus.hasOwnProperty(status)) {
        res.status(400).send({error: 'Invalid status'});
    }

    const project = await Project.findById(id);
    if (project) {
        if (status == ActivityStatus.Rejected && req.user.username != project.owner) {
            return res.status(403).send({error: 'You are not the owner of the project'});
        }

        const phaseActivity = project.phases.flatMap((phase: any) => phase.activities).find((act: any) => act.activityId === activityId);
        // check if the user is a participant in the activity
        const activity = await Activity.findById(activityId);
        if (activity && phaseActivity) {
            if (!activity.participants.filter((participant) => participant.username == req.user.username)) {
                return res.status(403).send({error: 'You are not a participant in the activity'});
            }

            phaseActivity.status = status;
            await project.save();
            res.status(200).send
        } else {
            res.status(404).send({error: "Activity doesn't exist!"});
        }
    } else {
        res.status(404).send({error: "Project doesn't exist!"});
    }
}

export const modifyProject = async (req: any, res: any) => {
    const {id} = req.params;
    const {actors, title, phases} = req.body;

    const project = await Project.findById(id);
    if (project) {
        if (project.owner !== req.user.username) {
            return res.status(403).send({error: 'You are not the owner of the project'});
        }

        // check that all actor exists
        const actorsExist = await Promise.all(actors.map(async (actor: string) => {
            return User.exists({username: actor});
        }));

        if (!actorsExist.every((actor: boolean) => actor)) {
            return res.status(400).send({error: 'One or more actors do not exist'});
        }

        project.actors = actors;
        project.title = title;

        await deleteAllActivities(project);

        const activitiesCreated = await createActivities(phases, req, res);
        if (!activitiesCreated) {
            return; // Stop further execution if activities creation failed
        }

        try {
            await project.save();
            res.status(200).send(project);
        } catch (error) {
            res.status(400).send({error: 'Error modifying project'});
        }
    } else {
        res.status(404).send({error: "Project doesn't exist!"});
    }
}

export const addProject = async (req: any, res: any) => {
    const {owner, actors, title, phases} = req.body;

    // check that all actor exists
    const actorsExist = await Promise.all(actors.map(async (actor: string) => {
        return User.exists({username: actor});
    }));

    if (!actorsExist.every((actor: boolean) => actor)) {
        return res.status(400).send({error: 'One or more actors do not exist'});
    }

    const activitiesCreated = await createActivities(phases, req, res);
    if (!activitiesCreated) {
        return; // Stop further execution if activities creation failed
    }

    const newProject = new Project({
        owner,
        actors,
        title,
        phases
    });

    try {
        const savedProject = await newProject.save();
        // send notification to all the invited actors
        actors.map(async (actor: string) => {
            const user = await User.findOne({username: actor});
            if (user) {
                await notificationController.sendNotification(user, {
                    title: 'New project',
                    body: `You have been invited to the project ${title}`
                });
            }
        });
        res.status(201).send(savedProject);
    } catch (error) {
        res.status(400).send({error: 'Error adding project'});
    }
}