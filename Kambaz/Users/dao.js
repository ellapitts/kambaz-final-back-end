import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function UsersDao() {

  const createUser = (user) => {
    const newUser = { ...user, _id: uuidv4() };
  return model.create(newUser);
  };

  const findAllUsers = () => model.find(); 

  // Retrieves user document from primary key
  const findUserById = (userId) => model.findById(userId);

  const findUserByUsername = (username) => model.findOne({ username: username });

  const findUserByCredentials = (username, password) => model.findOne({ username, password });

  // Compares first and last name against reg. expression
  const findUsersByPartialName = (partialName) => {
  const regex = new RegExp(partialName, "i"); // 'i' makes it case-insensitive
  return model.find({
    $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
  });
};

  const updateUser = (userId, user) => model.updateOne({ _id: userId }, { $set: user });

  const deleteUser = (userId) => model.deleteOne({ _id: userId });

  const findUsersByRole = (role) => model.find({ role: role }); // or just model.find({ role })
  return {
    createUser,
    findAllUsers,
    findUserById,
    findUserByUsername,
    findUserByCredentials,
    updateUser,
    deleteUser,
    findUsersByRole,
    findUsersByPartialName,
  };
}