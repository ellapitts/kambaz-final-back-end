import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export const findAllTodos = () => model.find();
export const findTodoById = (id) => model.findById(id);
export const createTodo = (todo) => {
    const newTodo = { ...todo, _id: uuidv4() };
    return model.create(newTodo);
};
export const updateTodo = (id, todo) => model.updateOne({ _id: id }, { $set: todo });
export const deleteTodo = (id) => model.deleteOne({ _id: id });
