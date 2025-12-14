/*******************************************
 * Users Routes - Alara Hakki
 * 
 * This is my users API routes.
 * I handle user CRUD and authentication.
 * IMPORTANT: Static routes must come BEFORE parameterized routes!
 *******************************************/
import UsersDao from "./dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  const dao = UsersDao();

  /* ========== AUTHENTICATION ROUTES ========== */
  /* These must come BEFORE parameterized routes like /api/users/:userId */

  const signup = async (req, res) => {
    try {
      const user = await dao.findUserByUsername(req.body.username);
      if (user) {
        res.status(400).json({ message: "Username already in use" });
        return;
      }
      const currentUser = await dao.createUser(req.body);
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error during signup" });
    }
  };

  const signin = async (req, res) => {
    try {
      const { username, password } = req.body;
      const currentUser = await dao.findUserByCredentials(username, password);
      if (currentUser) {
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
      } else {
        res.status(401).json({ message: "Unable to login. Try again later." });
      }
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Server error during signin" });
    }
  };

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

  /* Register auth routes FIRST (before :userId routes) */
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);

  /* ========== USER CRUD ROUTES ========== */

  const createUser = async (req, res) => {
    try {
      const user = await dao.createUser(req.body);
      res.json(user);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  };

  const findAllUsers = async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Find users error:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  };

  const findUserById = async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await dao.findUserById(userId);
      res.json(user);
    } catch (error) {
      console.error("Find user error:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const userUpdates = req.body;

      await dao.updateUser(userId, userUpdates);

      /* Update session if updating current user */
      const currentUser = req.session["currentUser"];
      if (currentUser && currentUser._id === userId) {
        const updatedUser = { ...currentUser, ...userUpdates };
        req.session["currentUser"] = updatedUser;
        res.json(updatedUser);
      } else {
        /* Return the updated user data */
        const updatedUser = await dao.findUserById(userId);
        res.json(updatedUser);
      }
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const status = await dao.deleteUser(userId);
      res.json(status);
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  };

  /* Register CRUD routes */
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);

  /* ========== ENROLLMENT ROUTES (in Users context) ========== */

  const findEnrollmentsForUser = async (req, res) => {
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
      const enrollments = await enrollmentsDao.findEnrollmentObjectsForUser(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Find enrollments error:", error);
      res.status(500).json({ message: "Error fetching enrollments" });
    }
  };

  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
}