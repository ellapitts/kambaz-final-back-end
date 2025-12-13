/*******************************************
 * Enrollments DAO - Alara Hakki
 * 
 * This is my data access object for enrollments.
 * I handle database operations for the enrollments collection.
 * Enrollments link users to courses (many-to-many).
 *******************************************/
import model from "./model.js";

/* I find all enrollments for a specific user */
export const findEnrollmentsForUser = (userId) => {
  return model.find({ user: userId });
};

/* I find all users enrolled in a specific course */
export const findUsersForCourse = async (courseId) => {
  const enrollments = await model.find({ course: courseId }).populate("user");
  return enrollments.map((e) => e.user);
};

/* I create a new enrollment - links user to course */
export const enrollUserInCourse = (userId, courseId) => {
  return model.create({
    _id: `${userId}-${courseId}`,  /* Composite ID ensures uniqueness */
    user: userId,
    course: courseId,
  });
};

/* I remove an enrollment - unlinks user from course */
export const unenrollUserFromCourse = (userId, courseId) => {
  return model.deleteOne({ user: userId, course: courseId });
};

/* I remove all enrollments for a course (when course is deleted) */
export const unenrollAllUsersFromCourse = (courseId) => {
  return model.deleteMany({ course: courseId });
};