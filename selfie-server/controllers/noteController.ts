import Note from '../models/Note';

const max_preview_length = 600;
export const getall = async (req: any, res: any) => {
    const username = req.user?.username
    const all_notes = await Note.find({owners: { $in: [username] }})
    const all_notes_shrinked = all_notes.map(
        (note: any) => { return {
            _id: note._id,
            content: note.content.substring(0, max_preview_length),
            title: note.title,
            creation: note.creation,
            lastmodify: note.lastmodify,
            category: note.category,
            contentLength: note.content.length // for note ordering
        }})
    res.status(200).send(all_notes_shrinked)
}

export const getid = async (req: any, res: any) => {
    const { id } = req.params
    const username = req.user?.username
    try {
        const note = await Note.findOne({ _id: id, owners: { $in: [username] }})
        res.status(200).send(note)
    } catch {
        res.status(404).send({ error: "Note doesn't exist!"})
    }
}

export const create = async (req: any, res: any) => {
    const username = req.user?.username
    const new_note = new Note({
        content: req.body.content,
        title: req.body.title,
        creation: req.body.creation,
        lastmodify: req.body.lastmodify,
        category: req.body.category,
        owners: [username],
        todoList: []
    })
    
    try {
        await new_note.save()
        res.status(200).send(new_note);
    } catch (error) {
        console.log(error)
        res.status(422).send( { error: "Wrong arguments!"})
    }
}

export const modify = async (req: any, res: any) => {
    const username = req.user?.username
    try {
        const note = await Note.findOne({ _id: req.params.id, owners: { $in: [username] }})
        if (note) {
            note.content = req.body.content
            note.title = req.body.title
            note.lastmodify = req.body.lastmodify
            note.category = req.body.category
            note.owners = req.body.owners
            note.todoList = req.body.todoList
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
    const username = req.user?.username
    try {
        await Note.deleteOne({ _id: req.params.id, owners: { $in: [username] }})
        res.status(204).send()
    } catch {
        res.status(404).send({ error: "Note doesn't exist!"})
    }
}