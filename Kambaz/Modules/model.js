/*******************************************
 * Modules Model - Alara Hakki
 * my mongoose model for modules collection
 *******************************************/
import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("ModuleModel", schema);
export default model;