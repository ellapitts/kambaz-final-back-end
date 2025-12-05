import { v4 as uuidv4 } from "uuid";
import model from "../Courses/model.js";

export default function ModulesDao(db) {
  
  async function findModulesForCourse(courseId) {
    const course = await model.findById(courseId);
    return course.modules;
    // const { modules } = db;
    // return modules.filter((module) => module.course === courseId);
  }

  async function createModule(courseId, module) {
    const newModule = { ...module, _id: uuidv4() };
    const status = await model.updateOne(
      { _id: courseId },
      { $push: { modules: newModule } }
    );
    // db.modules = [...db.modules, newModule];
    return newModule;
  }

  async function updateModule(courseId, moduleId, moduleUpdates) {
    const course = await model.findById(courseId);
    const module = course.modules.id(moduleId);
    // const { modules } = db;
    // const module = modules.find((module) => module._id === moduleId);
    Object.assign(module, moduleUpdates);
    await course.save();
    return module;
  }

  async function deleteModule(courseId, moduleId) {
     const status = await model.updateOne(
     { _id: courseId },
     { $pull: { modules: { _id: moduleId } } } // splices item out of array 
   );
   return status;
    // const { modules } = db;
    // db.modules = modules.filter((module) => module._id !== moduleId);
  }

  return {
    findModulesForCourse,
    createModule,
    updateModule,
    deleteModule,
  };
}
