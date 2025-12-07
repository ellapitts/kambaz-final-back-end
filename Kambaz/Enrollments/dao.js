// When a course is created, it needs to be associated with the creator. In a new Enrollments/dao.js file, implement enrollUserInCourse to enroll, or associate, a user to a course.
import model from "./model.js"; // Imports mongoose model
import { v4 as uuidv4 } from "uuid";

export default function EnrollmentsDao(db) {

    // 1. Find Courses for User (READ)
    // This is asynchronous because it queries the database.
  async function findEnrollmentsForUser(userId) {
    // Finds documents matching the user ID and fetches the linked Course document (.populate).
    const  enrollments  = await model.find({ user: userId }).populate("course");
    // Returns an array of the fully populated course objects
    return enrollments.map((enrollment) => enrollment.course);
    // return enrollments.filter((enrollment) => enrollment.user === userId);
  }

  // Enroll user in course (Create)
  // This function is asynchronous because it modifies the database.
  async function enrollUserInCourse(userId, courseId) {
    return await model.create({
    user: userId,
    course: courseId,
    _id: `${userId}-${courseId}`,
  });
}
    // const newEnrollment = {
    //   user: userId,
    //   course: courseId,
    //   _id: `${userId}-${courseId}`// Creates a unique ID for the linking document
    // };
    // return await model.create(newEnrollment);
    // const { enrollments } = db;
    // enrollments.push({ _id: uuidv4(), user: userId, course: courseId });

    // 3. Unenroll User from Course (DELETE)
    // This function is asynchronous because it modifies the database.  
    async function unenrollUserFromCourse(user, course) {
      // Uses await and model.deleteOne() to delete the linking document.
      return await model.deleteOne({ user, course});
    // const { enrollments } = db;
    // const index = enrollments.findIndex(
    //   (enrollment) => enrollment.user === userId && enrollment.course === courseId
    // );
    // if (index !== -1) {
    //   enrollments.splice(index, 1);
    // }
  }

    async function unenrollAllUserFromCourse(courseId) {
      return await model.deleteMany({ course: courseId});
  }

  // 4. Find Users for Course (READ) - Mimics the professor's structure
    async function findUsersForCourse(courseId) {
        const enrollments = await model.find({ course: courseId }).populate("user");
        return enrollments.map((enrollment) => enrollment.user);
    }

  // 5. Find Enrollment Objects for User (returns enrollment documents, not just courses)
  // This is used by the Dashboard to check enrollment status
  async function findEnrollmentObjectsForUser(userId) {
    // Returns enrollment documents with user and course fields
    return await model.find({ user: userId });
  }

  // Function to update enrollment object
  async function updateEnrollment(enrollmentId, enrollmentUpdates) {
    return await model.updateOne({ _id: enrollmentId }, { $set: enrollmentUpdates });
  }

  return { findEnrollmentsForUser, enrollUserInCourse, unenrollUserFromCourse, unenrollAllUserFromCourse, findUsersForCourse, findEnrollmentObjectsForUser, updateEnrollment };

}
