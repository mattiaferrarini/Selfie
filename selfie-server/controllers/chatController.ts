import Message from "../models/Message";

const sendMessage = async (sender: string, receiver: string, text: string) => {
    try {
        // const user: any = await User.findById(req.user._id);
        const message = new Message({
            senderUsername: sender,
            receiverUsername: receiver,
            text,
            createdAt: new Date(),
        });
        await message.save();
    } catch (err) {
        throw ('Error sending message');
    }
};

/*const listMessagesByUser = async (req: any, res: any) => {
    const current_user = req.user.username;
    const {user} = req.params;
    try {
        const messages = await Message.find({
            $or: [
                {senderId: user, receiverId: current_user},
                {senderId: current_user, receiverId: user},
            ],
        }).sort('createdAt');
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).send('Error listing messages');
    }
};*/

const listMessages = async (req: any, res: any) => {
    const current_user = req.user.username;
    try {
        const messages = await Message.find({
            $or: [
                {receiverUsername: current_user},
                {senderUsername: current_user},
            ],
        }).select('senderUsername receiverUsername text createdAt')
            .sort('-createdAt'); // from most recent to oldest
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).send('Error listing messages');
    }
};

export default {
    sendMessage,
    listMessages
}