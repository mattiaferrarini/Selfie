import Resource, { IResource } from "../models/Resource";
import { getUserByUsername } from "./userController";
import timeService from "../services/timeService";
import { getEventsByUserAndDate } from "./eventController";
import notificationController from "./notificationController";

const formatResource = (resource: any) => {
    return {
        id: resource._id,
        name: resource.name,
        username: resource.username
    };
}

// Function to get all resources
export const getAllResources = async (req: any, res: any) => {
    try {
        const resources = await Resource.find();
        const formattedResources = resources.map((resource: any) => formatResource(resource));
        res.status(200).send(formattedResources);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving resources' });
    }
}

// Function to get a resource by username
export const getResource = async (req: any, res: any) => {
    const { username } = req.params;
    const resource = await Resource.findOne({ username });

    if (resource) {
        res.status(200).send(formatResource(resource));
    } else {
        res.status(404).send({ error: "Resource doesn't exist!" });
    }
}

// Function to add a new resource
export const addResource = async (req: any, res: any) => {
    const name = req.body.name, username = req.body.username;

    const resMatch = await Resource.findOne({ username });
    const userMatch = await getUserByUsername(username);

    if (resMatch || userMatch)
        res.status(409).send({ error: 'The username is already taken.' });
    else {
        const newResource = new Resource({ name: name, username: username });

        try {
            await newResource.save();
            res.status(201).send(formatResource(newResource));
        } catch (error) {
            res.status(400).send({ error: 'Error creating resource' });
        }
    }
}

// Function to delete a resource by ID
export const deleteResource = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const resource = await Resource.findById(id);

        if (resource) {
            await Resource.findByIdAndDelete(id);
            await notifyOfDeletion(resource);
        }

        res.status(204).send();
    } catch (error) {
        res.status(404).send({ error: "Resource doesn't exist!" });
    }
}

const notifyOfDeletion = async (Resource: IResource) => {
    const username = Resource.username;
    const now = new Date();
    const farFuture = timeService.moveAheadByYears(now, 1);

    // get future events that the resource is part of
    const events = await getEventsByUserAndDate(username, now, farFuture);

    events.forEach(async (event: any) => {
        // remove the resource from the event
        event.participants = event.participants.filter((participant: any) => participant.username !== username);
        await event.save();

        // send notification to all participants
        const title = `Resource ${Resource.name} has been deleted`;
        const body = `The resource ${Resource.name} has been deleted and won't be available for ${event.title} anymore.`;

        event.participants.forEach(async (participant: any) => {
            if (participant.status === "accepted") {
                const user = await getUserByUsername(participant.username);
                if (user)
                    notificationController.sendNotification(user, { title, body });
            }
        });
    });
}

export const isResource = async (username: string) => {
    const resource = await Resource.findOne({ username });
    if (resource)
        return true;
    else
        return false;
}

export const getResourcesByUsername = async (username: string) => {
    try{
        const user = await Resource.findOne({ username });
    return user;
    }
    catch{
        return null;
    }
}
