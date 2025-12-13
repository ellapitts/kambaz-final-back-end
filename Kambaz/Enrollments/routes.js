/*******************************************
 * Enrollments Routes - Alara Hakki
 * 
 * These are my enrollment API routes.
 * I handle enrolling and unenrolling users.
 * "current" refers to logged-in user from session.
 *******************************************/
import * as dao from "./dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function EnrollmentRoutes(app) {
  
  /* I get all enrollments for a user */
  const findEnrollmentsForUser = async (req, res) => {
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
  };

  /* I enroll a user in a course */
  const enrollUserInCourse = async (req, res) => {
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
  };

  /* I unenroll a user from a course */
  const unenrollUserFromCourse = async (req, res) => {
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
  };

  /* I register my routes */
  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
  app.post("/api/users/:userId/courses/:courseId", enrollUserInCourse);
  app.delete("/api/users/:userId/courses/:courseId", unenrollUserFromCourse);
}