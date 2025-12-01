import mongoose from "mongoose";
const userSchema = new mongoose.Schema({ // creates schema 
    _id: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    email: String,
    dob: Date,
    role: {
      type: String,
      enum: ["STUDENT", "FACULTY", "ADMIN", "USER"],
      default: "USER",
    },
    loginId: String,
    section: String,
    lastActivity: Date,
    totalActivity: String,
  },
  { collection: "users" } // store data in "users" collection
);
export default userSchema;

