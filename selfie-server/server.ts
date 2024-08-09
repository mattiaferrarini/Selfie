import express from 'express';
import mongoose from "mongoose";
import passport from "passport";
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import chatRoutes from './routes/chat';
import noteRoutes from './routes/note';
import eventRoutes from './routes/event';
import activityRoutes from './routes/activity';
import unavailabilityRoutes from './routes/unavailability';
import notificationRoutes from './routes/notification';
import userRoutes from './routes/user';
import resourceRoutes from './routes/resource';
import inviteRoutes from './routes/invite';
import session from "express-session";
import cors from 'cors'
import dotenv from 'dotenv';
import strategy from "./config/passport";
import ensureAuthenticated from "./middlewares/authMiddleware";
import * as http from "node:http";
import {IUser} from "./models/User";
import WebSocket from 'ws';
import {handleConnection} from "./ws/wsHandler";

dotenv.config({path: './.env.local'});

// Create Express server
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());
const corsOptions = {
    origin: process.env.CORS_ORIGIN, // Specify the origin of your frontend
    credentials: true,               // Allow credentials (cookies, headers)
};

app.use(cors(corsOptions));
app.use(express.urlencoded({extended: true}));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/selfie')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

// Session configuration
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
});
app.use(sessionMiddleware);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(strategy);

// Routes
app.use('/auth', authRoutes);
app.use('/profile', ensureAuthenticated, profileRoutes);
app.use('/chat', ensureAuthenticated, chatRoutes);
app.use('/note', ensureAuthenticated, noteRoutes);
app.use('/notification', ensureAuthenticated, notificationRoutes);
app.use('/event', ensureAuthenticated, eventRoutes);
app.use('/activity', ensureAuthenticated, activityRoutes);
app.use('/unavailability', ensureAuthenticated, unavailabilityRoutes);
app.use('/user', ensureAuthenticated, userRoutes);
app.use('/resource', ensureAuthenticated, resourceRoutes);
app.use('/invite', ensureAuthenticated, inviteRoutes);

const server = http.createServer(app);

const wss = new WebSocket.Server({server});

const userConnections = new Map<string, WebSocket[]>();
wss.on('connection', (ws, req: any) => {
    // Handle session and passport for WebSocket
    sessionMiddleware(req, {} as any, () => {
        passport.initialize()(req, {} as any, () => {
            passport.session()(req, {} as any, () => {
                if (req.isAuthenticated()) {
                    const user = req.user as IUser;

                    handleConnection(ws, req, userConnections, user);
                } else {
                    ws.send(`Unauthorized`);
                    ws.close();
                }
            });
        });
    });
});

server.listen(PORT);