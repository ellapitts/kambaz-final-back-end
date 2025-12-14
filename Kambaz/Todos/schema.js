import mongoose from "mongoose";
const schema = new mongoose.Schema(
    {
        _id: String,
        title: String,
        completed: Boolean,
        description: String,
    },
    { collection: "todos" }
);
export default schema;
