import Note from '../models/note/Note';


export const getall = async (req: any, res: any) => {
    const all_notes = await Note.find();
    res.status(200).send(all_notes)
}

export const getid = async (req: any, res: any) => {
    const { id } = req.params
    try {
        const note = await Note.findById(id)
        res.status(200).send(note)
    } catch {
        res.status(404).send({ error: "Note doesn't exist!"})
    }
    const note = await Note.findById(id);
    res.status(200).send(note)
}

export const create = async (req: any, res: any) => {
    const new_note = new Note({
        content: req.body.content,
        title: req.body.title,
        creation: req.body.creation,
        lastmodify: req.body.lastmodify
    })
    
    try {
        await new_note.save()
        res.status(200).send(new_note);
    } catch (error) {
        res.status(422).send( { error: "Wrong arguments!"})
    }
}

export const modify = async (req: any, res: any) => {
    try {
        const note = await Note.findById(req.params.id)

        if (note) { // ??
            note.content = req.body.content,
            note.title = req.body.title,
            note.lastmodify = req.body.lastmodify
        } else {
            throw new Error("is null")
        }
        await note.save()
		res.status(200).send(note)
    } catch {
        res.status(404).send({ error: "Note doesn't exist!"})
    }
}

export const remove = async (req: any, res: any) => {
    try {
        await Note.deleteOne({ _id: req.params.id })
        res.status(204).send()
    } catch {
        res.status(404).send({ error: "Note doesn't exist!"})
    }
}