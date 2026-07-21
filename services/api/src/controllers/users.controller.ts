import type { UserRepository } from "../repositories/user.repository.js";
import type { Request, Response } from "express";

class UserController {
  readonly userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public getUser = async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const user = await this.userRepository.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
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

export { UserController };
