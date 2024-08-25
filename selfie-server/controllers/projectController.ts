import Project from "../models/Project";
import User from "../models/User";
import Activity from "../models/Activity";


export const addProject = async (req: any, res: any) => {
    const {owner, actors, title, phases} = req.body;

    // check that all actor exists
    const actorsExist = await Promise.all(actors.map(async (actor: string) => {
        return User.exists({username: actor});
    }));

    if (!actorsExist.every((actor: boolean) => actor)) {
        return res.status(400).send({error: 'One or more actors do not exist'});
    }

    phases.map((phase: any) => {
        phase.activities.map((activity: any) => {
            const createdActivity = new Activity(activity.activity);
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
        res.status(201).send(savedProject);
    } catch (error) {
        res.status(400).send({error: 'Error adding project'});
    }
}