// Kambaz/Enrollments/model.js
import mongoose from "mongoose";
import schema from "./schema.js";
// Compile the model, using "EnrollmentModel" as the internal reference name
const model = mongoose.model("EnrollmentModel", schema);
export default model;