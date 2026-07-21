import { Router, type Router as ExpressRouter } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { UserRepository } from "../repositories/user.repository.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRoute: ExpressRouter = Router();

const userRepository = new UserRepository();
const authController = new AuthController(userRepository);

authRoute.post("/register", authController.registerUser);
authRoute.post("/login", authController.loginUser);
authRoute.post("/logout", authMiddleware, authController.logoutUser);

export { authRoute };
