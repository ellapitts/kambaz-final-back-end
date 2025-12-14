/*******************************************
 * Server Entry Point - Alara Hakki
 * 
 * This is my main server file.
 * I configure Express, CORS, sessions, and MongoDB.
 * All my routes are registered here.
 *******************************************/
import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import mongoose from "mongoose";

/* I import all my route modules */
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";

const app = express();

/* I configure CORS to allow credentials (cookies) from my frontend */
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL || "http://localhost:3000",
}));

/* I configure session options */
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

/* In production, I enable secure cookies */
if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
  };
}

/* IMPORTANT: Session must come AFTER cors but BEFORE routes */
app.use(session(sessionOptions));
app.use(express.json());

import Lab5 from "./Lab5/index.js";
import TodoRoutes from "./Kambaz/Todos/routes.js";

/* I register all my routes */
Lab5(app);
TodoRoutes(app);
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);

/* I connect to MongoDB */
const CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || "mongodb://localhost:27017/kambaz";
mongoose.connect(CONNECTION_STRING);

/* I start the server */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to Database: ${CONNECTION_STRING.includes("mongodb+srv") ? "Remote (Atlas)" : "Local"}`);
});