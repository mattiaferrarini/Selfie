import Project from "../models/Project";
import User from "../models/User";
import Activity from "../models/Activity";
import notificationController from "./notificationController";

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

export const modifyProject = async (req: any, res: any) => {
    const {id} = req.params;
    const {actors, title, phases} = req.body;

    // check that all actor exists
    const actorsExist = await Promise.all(actors.map(async (actor: string) => {
        return User.exists({username: actor});
    }));

    if (!actorsExist.every((actor: boolean) => actor)) {
        return res.status(400).send({error: 'One or more actors do not exist'});
    }

    const project = await Project.findById(id);
    if (project) {
        project.actors = actors;
        project.title = title;



        try {
            await project.save();
            res.status(200).send(project);
        } catch (error) {
            res.status(400).send({error: 'Error modifying project'});
        }
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

    const createdActivitiesIds: string[] = [];

    phases.map((phase: any) => {
        phase.activities.map((activity: any) => {
            try {
                const createdActivity = new Activity(activity.activity);
                createdActivity.save();
                createdActivitiesIds.push(createdActivity._id as string);
                activity.activityId = createdActivity._id;
                if (activity.linkedActivityId) {
                    const linkedActivity = phase.activities.find((activity: any) => {
                        return activity.localId === activity.linkedActivityId;
                    });

                    if (!linkedActivity) {
                        return res.status(400).send({error: 'Linked activity does not exist'});
                    } else if (linkedActivity === activity) {
                        return res.status(400).send({error: 'An activity cannot be linked to itself'});
                    }
                }
            } catch (error) {
                // delete all activities created so far
                createdActivitiesIds.map(async (activityId: string) => {
                    await Activity.findByIdAndDelete(activityId);
                });
                return res.status(400).send({error: 'Error creating activity'});
            }
        });
    });

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