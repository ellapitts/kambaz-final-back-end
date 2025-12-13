/*******************************************
 * Modules Routes - Alara Hakki
 * 
 * These are my module API routes.
 * I handle CRUD operations for modules.
 * Modules belong to courses.
 *******************************************/
import * as dao from "./dao.js";

export default function ModuleRoutes(app) {
  
  /* I get all modules for a course */
  const findModulesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const modules = await dao.findModulesForCourse(courseId);
    res.json(modules);
  };

  /* I create a new module in a course */
  const createModule = async (req, res) => {
    const { courseId } = req.params;
    const module = { ...req.body, course: courseId };
    const newModule = await dao.createModule(module);
    res.json(newModule);
  };

  /* I update an existing module */
  const updateModule = async (req, res) => {
    const { moduleId } = req.params;
    const status = await dao.updateModule(moduleId, req.body);
    res.json(status);
  };

  /* I delete a module */
  const deleteModule = async (req, res) => {
    const { moduleId } = req.params;
    const status = await dao.deleteModule(moduleId);
    res.json(status);
  };

  /* I register my routes */
  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.post("/api/courses/:courseId/modules", createModule);
  app.put("/api/courses/:courseId/modules/:moduleId", updateModule);
  app.delete("/api/courses/:courseId/modules/:moduleId", deleteModule);
}