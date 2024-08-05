// Import the Event model
import Event from '../models/Event';
import ical from 'node-ical';
import { sendEmailWithAttachments } from '../services/mailerService';

const formatEvent = (event: any) => {
    return {
        id: event._id,
        allDay: event.allDay,
        title: event.title,
        start: event.start,
        end: event.end,
        repetition: event.repetition,
        location: event.location,
        notification: event.notification,
        participants: event.participants
    };
}

// Function to get all events with a specified user as a participant
export const getEventsByUser = async (req: any, res: any) => {
    const { username } = req.params;
    try {
        const events = await Event.find({ "participants.username": username });
        const formattedEvents = events.map((event: any) => formatEvent(event));

        res.status(200).send(formattedEvents);
        //res.status(200).send(events);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving events' });
    }
}

// Function to delete an event by ID
export const deleteEvent = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await Event.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).send({ error: "Event doesn't exist!" });
    }
}

// Function to add a new event
export const addEvent = async (req: any, res: any) => {
    const newEvent = new Event({
        allDay: req.body.allDay,
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        repetition: req.body.repetition,
        location: req.body.location,
        notification: req.body.notification,
        participants: req.body.participants
    });

    try {
        await newEvent.save();
        res.status(201).send(formatEvent(newEvent));
    } catch (error) {
        res.status(422).send({ error: 'Error creating event' });
    }
}

// Function to modify an existing event by ID
export const modifyEvent = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const event = await Event.findById(id);

        if (event) {
            event.title = req.body.title;
            event.allDay = req.body.allDay;
            event.start = req.body.start;
            event.end = req.body.end;
            event.repetition = req.body.repetition;
            event.location = req.body.location;
            event.notification = req.body.notification;
            event.participants = req.body.participants;

            await event.save();
            res.status(200).send(formatEvent(event));
        } else {
            res.status(404).send({ error: "Event doesn't exist!" });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error updatding event' });
    }
}

export const importICalendar = async (req: any, res: any) => {
    const { icalStr } = req.body;
    try {
        const events = await ical.async.parseICS(icalStr);
        res.status(200).send(events);
    } catch (error) {
        res.status(500).send({ error: 'Error importing iCalendar' });
    }
}

export const sendExportViaEmail = async (req: any, res: any) => {
    const file = req.file;
    const {to, eventName, yahooLink, googleLink, outlookLink} = req.body;

    if (!file) {
        res.status(400).send({ error: 'No file uploaded' });
        return;
    }
    else{
        const subject = `Export of ${eventName}`;
        const text = `Export of ${eventName} attached.\nYou can also add the event to your calendar by clicking the following links:\nYahoo: ${yahooLink}\nGoogle: ${googleLink}\nOutlook: ${outlookLink}`;
        const attachments = [{ path: file.path}];

        try {
            await sendEmailWithAttachments(to, subject, text, attachments, true);
            res.status(200).send();
        } catch (error) {
            res.status(500).send({ error: 'Error sending email' });
        }
    }
}