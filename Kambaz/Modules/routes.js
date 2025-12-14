/*******************************************
 * Modules Routes - Alara Hakki
 * 
 * These are my module API routes.
 * I handle CRUD operations for modules.
 * Modules are embedded in courses.
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
    const newModule = await dao.createModule(courseId, req.body);
    res.json(newModule);
  };

  /* I update an existing module */
  const updateModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const module = await dao.updateModule(courseId, moduleId, req.body);
    res.json(module);
  };

  /* I delete a module */
  const deleteModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const status = await dao.deleteModule(courseId, moduleId);
    res.json(status);
  };

  /* I register my routes */
  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.post("/api/courses/:courseId/modules", createModule);
  app.put("/api/courses/:courseId/modules/:moduleId", updateModule);
  app.delete("/api/courses/:courseId/modules/:moduleId", deleteModule);
}