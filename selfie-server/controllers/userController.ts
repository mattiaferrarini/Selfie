import { Request, Response } from 'express';
import User from '../models/User';

// Function to check if a user with the given username exists
export const checkUserExists = async (req: Request, res: Response) => {
    const { username } = req.body;

    // Find the user with the given username in the database
    const user = await User.findOne({ username });

    if (user) {
        res.status(200).json({ exists: true });
    } else {
        res.status(200).json({ exists: false });
    }
};