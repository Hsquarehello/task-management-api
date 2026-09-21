import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { RegisterSchema, LoginSchema } from "../validations/user.validation.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validateData = RegisterSchema.parse(req.body);
      const result = await this.userService.register(validateData);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    },
  );

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validateData = LoginSchema.parse(req.body);
    const result = await this.userService.login(validateData);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  });
}
