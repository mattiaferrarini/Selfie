import Unavailability from "../models/Unavailability";

const formatUnavailability = (unavailability: any) => {
    return {
        id: unavailability._id,
        title: unavailability.title,
        allDay: unavailability.allDay,
        start: unavailability.start,
        end: unavailability.end,
        repetition: unavailability.repetition,
        username: unavailability.username
    };
};

export const getUnavailabilitiesByUser = async (req: any, res: any) => {
    const { username } = req.params;
    try {
        const unavailabilities = await Unavailability.find({ username: username });
        const formattedUnavailabilities = unavailabilities.map((unavailability: any) => formatUnavailability(unavailability));
        res.status(200).send(formattedUnavailabilities);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving unavailabilities' });
    }
};

export const deleteUnavailability = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await Unavailability.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).send({ error: "Unavailability doesn't exist!" });
    }
};

export const addUnavailability = async (req: any, res: any) => {
    const newUnavailability = new Unavailability({
        title: req.body.title,
        allDay: req.body.allDay,
        start: req.body.start,
        end: req.body.end,
        repetition: req.body.repetition,
        username: req.body.username
    });

    try {
        await newUnavailability.save();
        res.status(201).send(formatUnavailability(newUnavailability));
    } catch (error) {
        res.status(400).send({ error: 'Error adding unavailability' });
    }
};

export const modifyUnavailability = async (req: any, res: any) => {
    const { id } = req.params;
    const { title, allDay, start, end, repetition, username } = req.body;
    try {
        const updatedUnavailability = await Unavailability.findByIdAndUpdate(id, { title, allDay, start, end, repetition, username }, { new: true });
        res.status(200).send(formatUnavailability(updatedUnavailability));
    } catch (error) {
        res.status(404).send({ error: "Unavailability doesn't exist!" });
    }
};