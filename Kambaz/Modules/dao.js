/*******************************************
 * Modules DAO - Alara Hakki
 * 
 * This is my data access object for modules.
 * I handle database operations for the modules collection.
 * Each module belongs to a course.
 *******************************************/
import model from "./model.js";

/* I find all modules for a specific course */
export const findModulesForCourse = (courseId) => {
  return model.find({ course: courseId });
};

/* I create a new module with generated ID */
export const createModule = (module) => {
  const newModule = { 
    ...module, 
    _id: new Date().getTime().toString()  /* I generate unique ID using timestamp */
  };
  return model.create(newModule);
};

/* I update a module by ID */
export const updateModule = (moduleId, moduleUpdates) => {
  return model.updateOne({ _id: moduleId }, { $set: moduleUpdates });
};

/* I delete a module by ID */
export const deleteModule = (moduleId) => {
  return model.deleteOne({ _id: moduleId });
};