import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("TodoModel", schema);
export default model;
