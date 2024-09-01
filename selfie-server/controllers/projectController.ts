import Project, {ActivityStatus, IProject} from "../models/Project";
import User from "../models/User";
import Activity from "../models/Activity";
import notificationController from "./notificationController";
import {createActivity, deleteActivityById} from "./activityController";

const formatProject = async (project: IProject) => {
    project = project.toObject();
    for (const phase of project.phases) {
        for (const activity of phase.activities) {
            activity.activity = await Activity.findById(activity.activityId);
        }
    }
    return project;
}

export const getProjectById = async (req: any, res: any) => {
    const {id} = req.params;
    try {
        const project = await Project.findById(id);
        if (project) {
            res.status(200).send(await formatProject(project));
        } else {
            res.status(404).send({error: "Project doesn't exist!"});
        }
    } catch (error) {
        res.status(404).send({error: "Project doesn't exist!"});
    }
}

export const getAllProjects = async (req: any, res: any) => {
    const username = req.user.username;

    try {
        const projects = await Project.find({
            $or: [
                {owner: username},
                {actors: username}
            ]
        });

        const projectsWithActivities = await Promise.all(projects.map(async (project) => {
            return await formatProject(project);
        }));
        res.status(200).send(projectsWithActivities);
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

const getAllProjectActivitiesIds = (project: any) => {
    return project.phases.flatMap((phase: any) => phase.activities).map((activity: any) => activity.activityId);
}

const deleteAllProjectActivities = async (activitiesId: string[]) => {
    for (const activityId of activitiesId) {
        await deleteActivityById(activityId);
    }
}

const addProjectIdToActivities = async (project: any) => {
    for (const phase of project.phases) {
        for (const activity of phase.activities) {
            const act = await Activity.findById(activity.activityId);
            if (act) {
                act.projectId = project._id;
                await act.save();
            }
        }
    }
}

const createActivities = async (phases: any, req: any, res: any): Promise<boolean> => {
    const createdActivitiesIds: string[] = [];

    let linkedActivities;
    for (const phase of phases) {
        for (const activity of phase.activities) {
            try {
                activity.activity._id = undefined;
                const createdActivity = new Activity(activity.activity);
                await createActivity(createdActivity, req);
                createdActivitiesIds.push(createdActivity._id as string);
                activity.activityId = createdActivity._id;

                if (activity.linkedActivityId) {
                    let linkedActivity = phase.activities.find((act: any) => act.localId === activity.linkedActivityId);

                    if (!linkedActivity) {
                        throw new Error('Linked activity does not exist');
                    } else if (linkedActivity === activity) {
                        throw new Error('An activity cannot be linked to itself');
                    }

                    linkedActivities = [activity.localId];
                    // check that following linked activities are valid and do not point recursively to themselves
                    while (linkedActivity) {
                        linkedActivities.push(linkedActivity.localId);
                        if ((new Set(linkedActivities)).size !== linkedActivities.length) {
                            throw new Error('Linked activities cannot be indirectly linked to themselves');
                        }
                        linkedActivity = phase.activities.find((act: any) => act.localId === linkedActivity.linkedActivityId);
                    }
                }
            } catch (error) {
                // delete all activities created so far
                for (const activityId of createdActivitiesIds) {
                    await deleteActivityById(activityId);
                }
                res.status(400).send({error: 'Error creating activity' + error});
                return false;
            }
        }
    }
    return true;
};

export const modifyStatus = async (req: any, res: any) => {
    const {id} = req.params;
    const {status, input, output, activityId} = req.body;

    if (!ActivityStatus.hasOwnProperty(status)) {
        res.status(400).send({error: 'Invalid status'});
    }

    const project = await Project.findById(id);
    if (project) {
        if (status == ActivityStatus.Rejected && req.user.username != project.owner) {
            return res.status(403).send({error: 'You are not the owner of the project'});
        }

        const phaseActivity = project.phases.flatMap((phase: any) => phase.activities).find((act: any) => act.activityId == activityId);
        // check if the user is a participant in the activity
        const activity = await Activity.findById(activityId);
        if (activity && phaseActivity) {
            if (!activity.participants.filter((participant) => participant.username == req.user.username)) {
                return res.status(403).send({error: 'You are not a participant in the activity'});
            }

            phaseActivity.status = status;
            phaseActivity.output = output;
            if (phaseActivity.linkedActivityId == "")
                phaseActivity.input = input;
            await project.save();
            res.status(200).send(await formatProject(project));
        } else {
            res.status(404).send({error: "Activity doesn't exist!"});
        }
    } else {
        res.status(404).send({error: "Project doesn't exist!"});
    }
}

const checkActorsAndParticipants = async (actors: string[], phases: any, project: any, res: any) => {
    const actorsExist = await Promise.all(actors.map(async (actor: string) => {
        return User.exists({username: actor});
    }));

    if (!actorsExist.every((actor) => actor)) {
        res.status(400).send({error: 'One or more actors do not exist'});
        return false;
    }

    const participants = phases.flatMap((phase: any) => phase.activities).flatMap((activity: any) => activity.activity.participants);
    if (!participants.every((participant: any) => actors.includes(participant.username) || participant.username === project.owner)) {
        res.status(400).send({error: 'One or more participants are not actors'});
        return false;
    }

    return true;
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
        if (!await checkActorsAndParticipants(actors, phases, project, res)) {
            return; // Stop further execution if actors or participants are invalid
        }

        project.actors = actors;
        project.title = title;

        const oldIds = getAllProjectActivitiesIds(project);

        const activitiesCreated = await createActivities(phases, req, res);
        if (!activitiesCreated) {
            return; // Stop further execution if activities creation failed
        }

        try {
            project.phases = phases;
            const savedProject = await project.save();

            // link activities to the project
            await addProjectIdToActivities(savedProject);

            await deleteAllProjectActivities(oldIds);
            res.status(200).send(await formatProject(project));
        } catch (error) {
            res.status(400).send({error: error});
        }
    } else {
        res.status(404).send({error: "Project doesn't exist!"});
    }
}

export const addProject = async (req: any, res: any) => {
    const {owner, actors, title, phases} = req.body;

    // check that all actor exists
    if (!await checkActorsAndParticipants(actors, phases, {owner, phases}, res))
        return; // Stop further execution if actors or participants are invalid

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

        // link activities to the project
        await addProjectIdToActivities(savedProject);

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
        res.status(201).send(await formatProject(savedProject));
    } catch (error) {
        res.status(400).send({error: 'Error adding project' + error});
    }
}

export const leaveProject = async (req: any, res: any) => {
    const {id} = req.params;

    const project = await Project.findById(id)
    if (!project) {
        return res.status(404).send({error: "Project doesn't exist!"});
    }
    project.actors = project.actors.filter((actor: string) => actor !== req.user.username);
    project.save().then(() => {
        res.status(204).send();
    }).catch(() => {
        res.status(400).send({error: 'Error leaving project'});
    });
}