/*******************************************
 * Enrollments Routes - Alara Hakki
 * 
 * These are my enrollment API routes.
 * I handle enrolling and unenrolling users.
 * "current" refers to logged-in user from session.
 *******************************************/
import * as dao from "./dao.js";

export default function EnrollmentRoutes(app) {

  /* I get all enrollments for a user */
  const findEnrollmentsForUser = async (req, res) => {
    try {
      let { userId } = req.params;

      /* If userId is "current", I use the logged-in user */
      if (userId === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
          res.sendStatus(401);
          return;
        }
        userId = currentUser._id;
      }

      const enrollments = await dao.findEnrollmentsForUser(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Find enrollments error:", error);
      res.status(500).json({ message: "Error fetching enrollments" });
    }
  };

  /* I get all courses a user is enrolled in */
  const findCoursesForUser = async (req, res) => {
    try {
      let { userId } = req.params;

      if (userId === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
          res.sendStatus(401);
          return;
        }
        userId = currentUser._id;
      }

      const courses = await dao.findCoursesForUser(userId);
      res.json(courses);
    } catch (error) {
      console.error("Find courses for user error:", error);
      res.status(500).json({ message: "Error fetching courses" });
    }
  };

  /* I enroll a user in a course */
  const enrollUserInCourse = async (req, res) => {
    try {
      let { userId, courseId } = req.params;

      /* If userId is "current", I use the logged-in user */
      if (userId === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
          res.sendStatus(401);
          return;
        }
        userId = currentUser._id;
      }

      const enrollment = await dao.enrollUserInCourse(userId, courseId);
      res.json(enrollment);
    } catch (error) {
      console.error("Enroll error:", error);
      res.status(500).json({ message: "Error enrolling in course" });
    }
  };

  /* I unenroll a user from a course */
  const unenrollUserFromCourse = async (req, res) => {
    try {
      let { userId, courseId } = req.params;

      /* If userId is "current", I use the logged-in user */
      if (userId === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
          res.sendStatus(401);
          return;
        }
        userId = currentUser._id;
      }

      const status = await dao.unenrollUserFromCourse(userId, courseId);
      res.json(status);
    } catch (error) {
      console.error("Unenroll error:", error);
      res.status(500).json({ message: "Error unenrolling from course" });
    }
  };

  /* I register my routes */
  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
  app.get("/api/users/:userId/courses", findCoursesForUser);
  app.post("/api/users/:userId/courses/:courseId", enrollUserInCourse);
  app.delete("/api/users/:userId/courses/:courseId", unenrollUserFromCourse);
}