// Import the Event model
import Event, {IEvent} from '../models/Event';
import ical from 'node-ical';
import { sendEmailWithAttachments } from '../services/mailerService';
import eventService from '../services/eventService';
import * as inviteController from './inviteController';
import { isResource } from './resourceController';
import jobSchedulerService from '../services/jobSchedulerService';
import notificationController from './notificationController';
import _ from 'lodash';

const formatEvent = (event: any) => {
    return {
        id: event._id,
        owner: event.owner,
        allDay: event.allDay,
        title: event.title,
        start: event.start,
        end: event.end,
        timezone: event.timezone,
        repetition: event.repetition,
        location: event.location,
        notification: event.notification,
        participants: event.participants
    };
}

// Function to get all events with a specified user as a participant
export const getEventsByUser = async (req: any, res: any) => {
    const { username } = req.params;
    const { start, end } = req.query;

    const authUsername = req.user.username;

    if(!authUsername || authUsername !== username && !isResource(username))
        return res.status(403).send({ error: "You are not allowed to view this user's events!" });
    
    try {
        let startDate = start ? new Date(start) : undefined;
        let endDate = end ? new Date(end) : undefined;

        let events = await getEventsByUserAndDate(username, startDate, endDate);
        let formattedEvents = events.map((event: any) => formatEvent(event));
        res.status(200).send(formattedEvents);
        //res.status(200).send(events);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving events' });
    }
}

export const getEventsByUserAndDate = async (username: string, start?: Date, end?: Date) => {
    try {
        let events = await getAcceptedEventsByUser(username);

        if (start && end) {
            events = events.filter((event: any) => eventService.eventInRange(event, start, end));
        }
        return events;
        
    } catch (error) {
        throw new Error('Error retrieving events');
    }
}

export const getAcceptedEventsByUser = async (username: string) => {
    try {
        let events = await Event.find({
            participants: {
                $elemMatch: {
                    username: username,
                    status: 'accepted'
                }
            }
        });
        return events;
    } catch (error) {
        throw new Error('Error retrieving events');
    }
}

export const getEventById = async (req: any, res: any) => {
    const { id } = req.params;

    if(!req.user.username || !await accessAllowed(id, req.user.username))
        return res.status(403).send({ error: "You are not allowed to view this event!" });

    try {
        const event = await Event.findById(id);
        res.status(200).send(formatEvent(event));
    } catch (error) {
        res.status(404).send({ error: "Event doesn't exist!" });
    }
}

// Function to delete an event by ID
export const deleteEvent = async (req: any, res: any) => {
    const { id } = req.params;

    if(!req.user.username || !await modificationAllowed(id, req.user.username, req.user.isAdmin))
        return res.status(403).send({ error: "You are not allowed to delete this event!" });

    try {
        const event = await Event.findById(id);

        if(event){
            await jobSchedulerService.clearEventNotifications(event);
            await Event.findByIdAndDelete(id);
            await inviteController.deleteEventInvites(id);
        }

        res.status(204).send();
    } catch (error) {
        res.status(404).send({ error: "Event doesn't exist!" });
    }
}

// Function to add a new event
export const addEvent = async (req: any, res: any) => {
    const newEvent = new Event({
        allDay: req.body.allDay,
        owner: req.body.owner,
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        timezone: req.body.timezone,
        repetition: req.body.repetition,
        location: req.body.location,
        notification: req.body.notification,
        participants: req.body.participants
    });

    try {
        await newEvent.save();
        await inviteController.createInvitesForEvent(newEvent);
        await jobSchedulerService.scheduleEventNotification(newEvent);

        res.status(201).send(formatEvent(newEvent));
    } catch (error) {
        res.status(422).send({ error: 'Error creating event' });
    }
}

// Function to modify an existing event by ID
export const modifyEvent = async (req: any, res: any) => {
    const { id } = req.params;
    const authUsername = req.user.username;

    if(!authUsername || !await modificationAllowed(id, authUsername, req.user.isAdmin))
        return res.status(403).send({ error: "You are not allowed to modify this event!" });

    try {
        const event = await Event.findById(id);

        if (event) {
            const originalEvent = _.cloneDeep(event.toObject());

            const participantUsernames = req.body.participants?.map((participant: any) => participant.username);
            const removedParticipants = req.body.participants ? event.participants.filter((participant: any) => !participantUsernames.includes(participant.username)) : [];
            const removedUsernames = removedParticipants.map((participant: any) => participant.username);

            event.title = req.body.title;
            event.allDay = req.body.allDay;
            event.start = req.body.start;
            event.end = req.body.end;
            event.timezone = req.body.timezone;
            event.repetition = req.body.repetition;
            event.location = req.body.location;
            event.notification = req.body.notification;
            event.participants = req.body.participants;

            await event.save();

            if(!_.isEqual(originalEvent, event.toObject())){
                await inviteController.createInvitesForEvent(event);
                await inviteController.deleteEventParticipantsInvites(id, removedUsernames);
                await notifyOfChanges(event, authUsername);
                await jobSchedulerService.updateUpcomingEventNotification(event);
            }
            res.status(200).send(formatEvent(event));
        } else {
            res.status(404).send({ error: "Event doesn't exist!" });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error updatding event' });
    }
}

const notifyOfChanges = async(event: IEvent, committer: string) => {
    event.participants.forEach((participant: any) => {
        if(participant.status === 'accepted' && participant.username !== committer){
            notificationController.sendNotificationToUsername(participant.username, {title: 'Event updated', body: `Event ${event.title} has been updated.`});
        }
    });
}

export const getOverlappingEvents = async (req: any, res: any) => {
    const { username } = req.params;
    const { event } = req.body;

    try {
        let events = await Event.find({ username: username });
        events = events.filter((e: any) => eventService.eventsOverlap(e, event));
        const formattedEvents = events.map((e: any) => formatEvent(e));
        
        res.status(200).send(formattedEvents);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving events' });
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
        const text = `Export of ${eventName} attached.\n\nYou can also add the event to your calendar by clicking the following links:\nYahoo: ${yahooLink}\nGoogle: ${googleLink}\nOutlook: ${outlookLink}`;
        const attachments = [{ filename: file.originalname, content: file.buffer }];

        try {
            await sendEmailWithAttachments(to, subject, text, attachments);
            res.status(200).send('Email sent!');
        } catch (error) {
            res.status(500).send({ error: 'Error sending the email.' });
        }
    }
}

export const changeParticipantStatus = async (id: string, username:string, newStatus: string) => {
    try {
        const event = await Event.findById(id);
        if (event) {
            event.participants.forEach((participant: any) => {
                if (participant.username === username) {
                    participant.status = newStatus;
                    console.log("Participant status changed");
                }
            });
            await event.save();
        }
        else{
            throw new Error("Event not found");
        }
    } catch (error) {
        throw new Error("Error changing participant status");
    }
}

export const otherEventsOverlap = async (username: string, event: IEvent) => {
    try{
        let events = await getAcceptedEventsByUser(username);
        events = events.filter((e: any) => eventService.eventsOverlap(e, event));
        return events.length > 0;
    }
    catch{
        return false; // TODO: handle error
    }
}

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

const accessAllowed = async (id: string, authUsername: string) => {
    try {
        const event = await Event.findById(id);
        if(event)
            return event.owner === authUsername || 
                event.participants.some((participant: any) => participant.username === authUsername || isResource(participant.username));
        else
            return false;
    } 
    catch (error) {
        return false;
    }
}

const modificationAllowed = async (id: string, authUsername: string, isAdmin: boolean) => {
    try {
        const event = await Event.findById(id);
        if(event)
            return event.owner === authUsername || 
                (isAdmin && event.participants.some((participant: any) => isResource(participant.username)));
        else
            return false;
    } 
    catch (error) {
        return false;
    }
}
