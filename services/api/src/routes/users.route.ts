import { Router } from "express";
import { UserController } from "../controllers/users.controller.js";
import { UserRepository } from "../repositories/user.repository.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const usersRoute: Router = Router();

const userRepository = new UserRepository();
const userController = new UserController(userRepository);

usersRoute.get("/me", authMiddleware, userController.getUser);

export { usersRoute };
