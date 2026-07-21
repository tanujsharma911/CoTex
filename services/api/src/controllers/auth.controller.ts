import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import type { UserRepository } from "../repositories/user.repository.js";

class AuthController {
  readonly userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public registerUser = async (req: Request, res: Response) => {
    try {
      const { email, name, password } = req.body ?? {};

      if (!email || !name) {
        return res.status(400).json({
          success: false,
          message: "email and name are required",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "password is required for email accounts",
        });
      }

      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      }

      const user = await this.userRepository.createUser({
        email,
        name,
        password,
      });

      const token = user.generateToken();

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  public loginUser = async (req: Request, res: Response) => {
    try {
      const { email, username, password } = req.body ?? {};

      if (!email && !username) {
        return res.status(400).json({
          success: false,
          message: "email or username is required",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "password is required",
        });
      }

      const searchConditions: Array<Record<string, string>> = [];

      if (email) {
        searchConditions.push({ email });
      }

      if (username) {
        searchConditions.push({ username });
      }

      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password ?? "",
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = user.generateToken();

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  public logoutUser = async (req: Request, res: Response) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      return res.status(200).json({
        success: true,
        message: "User logged out successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}

export { AuthController };
