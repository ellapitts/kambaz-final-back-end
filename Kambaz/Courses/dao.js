/*******************************************
 * Courses DAO - Alara Hakki
 * 
 * This is my data access object for courses.
 * I handle database operations for the courses collection.
 * Uses MongoDB through Mongoose.
 *******************************************/
import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function CoursesDao() {

  /* I find all courses (just name and description for Dashboard) */
  function findAllCourses() {
    return model.find({}, { name: 1, description: 1, number: 1 });
  }

  /* I find a single course by ID */
  function findCourseById(courseId) {
    return model.findById(courseId);
  }

  /* I create a new course */
  function createCourse(course) {
    const newCourse = { ...course, _id: uuidv4() };
    return model.create(newCourse);
  }

  /* I delete a course */
  function deleteCourse(courseId) {
    return model.deleteOne({ _id: courseId });
  }

  /* I update a course */
  function updateCourse(courseId, courseUpdates) {
    return model.updateOne({ _id: courseId }, { $set: courseUpdates });
  }

  return {
    findAllCourses,
    findCourseById,
    createCourse,
    deleteCourse,
    updateCourse
  };
}
