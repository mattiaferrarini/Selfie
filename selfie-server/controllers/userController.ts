import User from "../models/User";

// get all users' username

export const getUserNames = async (req: any, res: any) => {
    const users = await User.find({}, "username");
    // extract only the username field from the users
    const usernames = users.map((user: any) => user.username);
    res.status(200).send(usernames);
}