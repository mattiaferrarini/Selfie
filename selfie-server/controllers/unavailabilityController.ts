import Unavailability from "../models/Unavailability";
import eventService from "../services/eventService";
import Event, { IEvent } from "../models/Event";
import timeService from "../services/timeService";

const formatUnavailability = (unavailability: any) => {
    return {
        id: unavailability._id,
        title: unavailability.title,
        allDay: unavailability.allDay,
        start: unavailability.start,
        end: unavailability.end,
        timezone: unavailability.timezone,
        repetition: unavailability.repetition,
        username: unavailability.username
    };
};

export const getUnavailabilitiesByUser = async (req: any, res: any) => {
    const { username } = req.params;
    const { start, end } = req.query;

    try {
        let unavailabilities = await Unavailability.find({ username: username });

        if(start && end) {
            const startDate = timeService.getStartOfDay(new Date(start));
            const endDate = timeService.getEndOfDay(new Date(end));
            unavailabilities = unavailabilities.filter((unav: any) => eventService.eventInRange(unav, startDate, endDate));
        }
        const formattedUnavailabilities = unavailabilities.map((unavailability: any) => formatUnavailability(unavailability));
        
        res.status(200).send(formattedUnavailabilities);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving unavailabilities' });
    }
}

export const deleteUnavailability = async (req: any, res: any) => {
    const { id } = req.params;
    const authUsername = req.user.username;

    if(!authUsername || !await modidicationAllowed(id, authUsername))
        return res.status(403).send({ error: "You are not allowed to delete this unavailability!" });

    try {
        await Unavailability.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).send({ error: "Unavailability doesn't exist!" });
    }
}

export const addUnavailability = async (req: any, res: any) => {
    const newUnavailability = new Unavailability({
        title: req.body.title,
        allDay: req.body.allDay,
        start: req.body.start,
        end: req.body.end,
        timezone: req.body.timezone,
        repetition: req.body.repetition,
        username: req.body.username
    });

    try {
        await newUnavailability.save();
        res.status(201).send(formatUnavailability(newUnavailability));
    } catch (error) {
        res.status(400).send({ error: 'Error adding unavailability' });
    }
}

export const modifyUnavailability = async (req: any, res: any) => {
    const { id } = req.params;
    const { title, allDay, start, end, repetition, username } = req.body;
    const authUsername = req.user.username;

    if(!authUsername || !await modidicationAllowed(id, authUsername))
        return res.status(403).send({ error: "You are not allowed to modify this unavailability!" });

    try {
        const updatedUnavailability = await Unavailability.findByIdAndUpdate(id, { title, allDay, start, end, repetition, username }, { new: true });
        res.status(200).send(formatUnavailability(updatedUnavailability));
    } catch (error) {
        res.status(404).send({ error: "Unavailability doesn't exist!" });
    }
}

export const getOverlappingUnavailabilities = async (req: any, res: any) => {
    const { username } = req.params;
    const { event } = req.body;

    try {
        let unavailabilities = await Unavailability.find({ username: username });
        unavailabilities = unavailabilities.filter((unav: any) => eventService.eventsOverlap(unav, event));
        const formattedUnavailabilities = unavailabilities.map((unavailability: any) => formatUnavailability(unavailability));
        
        res.status(200).send(formattedUnavailabilities);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving unavailabilities' });
    }
}

export const isUserFreeForEvent = async (username: string, event: IEvent) => {
    try{
        let unavailabilities = await Unavailability.find({ username: username });
        unavailabilities = unavailabilities.filter((unav: any) => eventService.eventsOverlap(unav, event));
        return unavailabilities.length === 0;
    }
    catch{
        return false; // TODO: handle this
    }
}

const modidicationAllowed = async (id: string, authUsername: string) => {
    try {
        const unavailability = await Unavailability.findById(id);
        
        if(unavailability)
            return unavailability.username === authUsername;
        else
            return false;
    } catch {
        return false;
    }
}