/*******************************************
 * Courses Routes - Alara Hakki
 * 
 * These are my course API routes.
 * I handle course CRUD operations.
 * Enrollment routes are in Enrollments/routes.js
 *******************************************/
import CoursesDao from "./dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app) {
  const dao = CoursesDao();

  /* ========== COURSE CRUD ROUTES ========== */

  const findAllCourses = async (req, res) => {
    try {
      const courses = await dao.findAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Find courses error:", error);
      res.status(500).json({ message: "Error fetching courses" });
    }
  };

  const findCourseById = async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await dao.findCourseById(courseId);
      res.json(course);
    } catch (error) {
      console.error("Find course error:", error);
      res.status(500).json({ message: "Error fetching course" });
    }
  };

  const createCourse = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      console.log("Creating new course for user:", currentUser._id);
      const newCourse = await dao.createCourse(req.body);
      console.log("Course created in DB:", newCourse._id);

      /* Auto-enroll the creator in the new course */
      const enrollment = await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
      console.log("User enrolled in course:", enrollment);

      res.json(newCourse);
    } catch (error) {
      console.error("Create course error:", error);
      res.status(500).json({ message: "Error creating course: " + error.message });
    }
  };

  const updateCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseUpdates = req.body;
      const status = await dao.updateCourse(courseId, courseUpdates);
      res.json(status);
    } catch (error) {
      console.error("Update course error:", error);
      res.status(500).json({ message: "Error updating course" });
    }
  };

  const deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      /* Remove all enrollments for this course first */
      await enrollmentsDao.unenrollAllUsersFromCourse(courseId);
      const status = await dao.deleteCourse(courseId);
      res.json(status);
    } catch (error) {
      console.error("Delete course error:", error);
      res.status(500).json({ message: "Error deleting course" });
    }
  };

  /* Find users enrolled in a course */
  const findUsersForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const users = await enrollmentsDao.findUsersForCourse(courseId);
      res.json(users);
    } catch (error) {
      console.error("Find users for course error:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  };

  /* Register routes */
  app.get("/api/courses", findAllCourses);
  app.get("/api/courses/:courseId", findCourseById);
  app.post("/api/courses", createCourse);
  app.put("/api/courses/:courseId", updateCourse);
  app.delete("/api/courses/:courseId", deleteCourse);
  app.get("/api/courses/:courseId/users", findUsersForCourse);
}
