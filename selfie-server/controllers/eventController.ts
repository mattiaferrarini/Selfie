// Import the Event model
import Event from '../models/Event';

// Function to get all events with a specified user as a participant
export const getEventsByUser = async (req: any, res: any) => {
    const { userId } = req.params;
    try {
        const events = await Event.find({ participants: userId });
        res.status(200).send(events);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving events' });
    }
};

// Function to delete an event by ID
export const deleteEvent = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await Event.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).send({ error: "Event doesn't exist!" });
    }
};

// Function to add a new event
export const addEvent = async (req: any, res: any) => {
    const newEvent = new Event({
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        repetition: req.body.repetition,
        place: req.body.place,
        notification: req.body.notification,
        participants: req.body.participants
    });

    try {
        await newEvent.save();
        res.status(201).send(newEvent);
    } catch (error) {
        res.status(422).send({ error: 'Error creating event' });
    }
};

// Function to modify an existing event by ID
export const modifyEvent = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const event = await Event.findById(id);

        if (event) {
            event.title = req.body.title;
            event.start = req.body.start;
            event.end = req.body.end;
            event.repetition = req.body.repetition;
            event.place = req.body.place;
            event.notification = req.body.notification;
            event.participants = req.body.participants;

            await event.save();
            res.status(200).send(event);
        } else {
            res.status(404).send({ error: "Event doesn't exist!" });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error updating event' });
    }
};