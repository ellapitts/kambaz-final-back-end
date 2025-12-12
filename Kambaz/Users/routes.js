import UsersDao from "./dao.js";
import EnrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  const dao = UsersDao();
  const enrollmentsDao = EnrollmentsDao();

  const createUser = async (req, res) => {
    const user = await dao.createUser(req.body);
    res.json(user);
  };

  const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    const status = await dao.deleteUser(userId);
    res.send(status);
  };

  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }

    const users = await dao.findAllUsers();
    res.json(users);
  };
  app.get("/api/users", findAllUsers);

  // Must be Async
  const findUserById = async (req, res) => {
    const userId = req.params.userId;
    const user = await dao.findUserById(userId);
    res.json(user);
  };

  const updateUser = async (req, res) => {
    const userId = req.params.userId;
    const userUpdates = req.body;

    await dao.updateUser(userId, userUpdates);

    // Call must also await async dao function
    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = { ...currentUser, ...userUpdates };
    }
    res.json(currentUser);
  };

  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };


  const signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("🔍 Signin attempt:");
    console.log("  Username received:", username);
    console.log("  Password received:", password);
    
    const currentUser = await dao.findUserByCredentials(username, password);
    console.log("  User found:", currentUser ? "YES" : "NO");
    
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  } catch (error) {
    console.error(" Signin error:", error);
    res.status(500).json({ message: "Server error during signin" });
  }
};
  // const signin = async (req, res) => {
  //   try {
  //     const { username, password } = req.body;
  //     const currentUser = await dao.findUserByCredentials(username, password);
  //     if (currentUser) {
  //       req.session["currentUser"] = currentUser;
  //       res.json(currentUser);
  //     } else {
  //       res.status(401).json({ message: "Unable to login. Try again later." });
  //     }
  //   } catch (err) {
  //     console.error("Signin error:", err);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // };

  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };

  // ======== Enrollment routes ========= //

  // Enroll user in course
  const enrollUserInCourse = async (req, res) => {
    let { userId, courseId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      userId = currentUser._id;
    }
    // AWAIT the DAO call, even if it sends back a status code
    await enrollmentsDao.enrollUserInCourse(userId, courseId);
    res.sendStatus(200);
  };

  // Unenroll user from a course -- MUST BE ASYNC
  const unenrollUserFromCourse = async (req, res) => {
    let { userId, courseId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      userId = currentUser._id;
    }
    await enrollmentsDao.unenrollUserFromCourse(userId, courseId);
    res.sendStatus(200);
  };

  const findEnrollmentsForUser = async (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      userId = currentUser._id;
    }
    // Use findEnrollmentObjectsForUser to return enrollment objects (with user and course fields)
    // instead of just courses, which is what the Dashboard needs
    const enrollments = await enrollmentsDao.findEnrollmentObjectsForUser(
      userId
    );
    res.json(enrollments);
  };

  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
  app.post("/api/users/:userId/courses/:courseId", enrollUserInCourse);
  app.delete("/api/users/:userId/courses/:courseId", unenrollUserFromCourse);
  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
}