import AssignmentsDao from "./dao.js";

export default function AssignmentsRoutes(app, db) {
  const dao = AssignmentsDao(db);
  
  const findAssignmentsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const assignments = await dao.findAssignmentsForCourse(courseId);
    res.json(assignments);
  };
  
  const createAssignmentForCourse = async (req, res) => {
    const { courseId } = req.params;
    const assignment = {
      ...req.body,
      course: courseId,
    };
    const newAssignment = await dao.createAssignment(assignment);
    res.json(newAssignment);
  };
  
  const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    await dao.deleteAssignment(assignmentId);
    res.sendStatus(200);
  };
  
  const updateAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const assignmentUpdates = req.body;
    const status = await dao.updateAssignment(assignmentId, assignmentUpdates);
    res.json(status);
  };
  
  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
  app.put("/api/assignments/:assignmentId", updateAssignment);
}