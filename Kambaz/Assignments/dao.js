// Kambaz/Assignments/dao.js
import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function AssignmentsDao() {

  // Find all assignments for a course
  async function findAssignmentsForCourse(courseId) {
    return await model.find({ course: courseId });
  }

  // Create a new assignment
  async function createAssignment(assignment) {
    // Generate ID if not provided
    const newAssignment = {
      ...assignment,
      _id: assignment._id || uuidv4()
    };
    return await model.create(newAssignment);
  }

  // Delete an assignment
  async function deleteAssignment(assignmentId) {
    return await model.deleteOne({ _id: assignmentId });
  }

  // Update an assignment
  async function updateAssignment(assignmentId, assignmentUpdates) {
    return await model.updateOne({ _id: assignmentId }, { $set: assignmentUpdates });
  }

  return {
    findAssignmentsForCourse,
    createAssignment,
    deleteAssignment,
    updateAssignment,
  };
}