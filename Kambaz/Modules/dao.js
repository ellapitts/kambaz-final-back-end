/*******************************************
 * Modules DAO - Alara Hakki
 * 
 * This is my data access object for modules.
 * Modules are EMBEDDED in courses (not separate collection).
 * I use the Courses model to access embedded modules.
 *******************************************/
import { v4 as uuidv4 } from "uuid";
import model from "../Courses/model.js";

/* I find all modules for a specific course */
export const findModulesForCourse = async (courseId) => {
  const course = await model.findById(courseId);
  return course ? course.modules : [];
};

/* I create a new module embedded in a course */
export const createModule = async (courseId, module) => {
  const newModule = {
    ...module,
    course: courseId,
    _id: uuidv4()
  };
  await model.updateOne(
    { _id: courseId },
    { $push: { modules: newModule } }
  );
  return newModule;
};

/* I update a module embedded in a course */
export const updateModule = async (courseId, moduleId, moduleUpdates) => {
  const course = await model.findById(courseId);
  const module = course.modules.id(moduleId);
  Object.assign(module, moduleUpdates);
  await course.save();
  return module;
};

/* I delete a module from a course */
export const deleteModule = async (courseId, moduleId) => {
  const status = await model.updateOne(
    { _id: courseId },
    { $pull: { modules: { _id: moduleId } } }
  );
  return status;
};