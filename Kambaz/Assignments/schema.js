// Kambaz/Assignments/schema.js
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    _id: String,
    title: String,
    course: { type: String, ref: "CourseModel" },
    description: String,
    points: Number,
    group: String,
    gradeDisplay: String,
    submissionType: String,
    onlineOptions: [String],
    assignTo: String,
    dueDate: String,
    availableFrom: String,
    availableUntil: String,
  },
  { collection: "assignments" }
);

export default assignmentSchema;

