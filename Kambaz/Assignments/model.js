// Kambaz/Assignments/model.js
import mongoose from "mongoose";
import schema from "./schema.js";

// Compile the model, using "AssignmentModel" as the internal reference name
const model = mongoose.model("AssignmentModel", schema);
export default model;

