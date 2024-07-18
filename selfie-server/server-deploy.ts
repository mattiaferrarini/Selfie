import express from 'express';
import mongoose from "mongoose";
import passport from "passport";
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import noteRoutes from './routes/note';
import session from "express-session";
import cors from 'cors'
import dotenv from 'dotenv';
import strategy from "./config/passport";
import ensureAuthenticated from "./middlewares/authMiddleware";

dotenv.config({ path: './.env.local' });

// Create Express server
const app = express();

const PORT = 8000;
app.use(express.json());
const corsOptions = {
    origin: process.env.CORS_ORIGIN, // Specify the origin of your frontend
    credentials: true,               // Allow credentials (cookies, headers)
};

app.use(cors(corsOptions));
app.use(express.urlencoded({extended: true}));

// serve static files in selfie-client/dist
const client_build_dir = __dirname + '/../selfie-client/dist';
app.use('/'  , express.static(client_build_dir));

app.use(express.urlencoded({ extended: true }))
app.use(cors())

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable('trust proxy');

// Database connection
const mongouri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_SITE}/${process.env.MONGO_DBNAME}?authSource=admin&writeConcern=majority`;

mongoose.connect(mongouri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error(`mongouri: ${mongouri}`);
        console.error('Error connecting to MongoDB', err);
    });

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(strategy);

// Routes
app.use('api/auth', authRoutes);

app.use('api/profile', ensureAuthenticated, profileRoutes);

app.use('api/note', ensureAuthenticated, noteRoutes);

app.listen(PORT);