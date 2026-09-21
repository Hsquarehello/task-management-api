import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, JwtPayload } from "../types/express.js";
import { AppError } from "../utils/appError.js";
import type { Role } from "../generated/prisma/enums.js";
import { TaskRepository } from "../repositories/task.repository.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const taskRepo = new TaskRepository();

export const authenticate = asyncHandler(
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Access token missing or invalid", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(
        new AppError("JWT_SECRET is not defined in server environment", 500),
      );
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  },
);

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized: User not authenticated", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("Forbidden: Insufficient system permissions", 403);
    }

    next();
  };
};

export const isTaskOwnerOrAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const taskId = req.params.id as string;
    if (!req.user) {
      return next(new AppError("Unauthorized access", 401));
    }
    const userId = req.user.id;
    const userRole = req.user.role;

    const task = await taskRepo.findById(taskId);
    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    const isAdmin = userRole === "ADMIN";
    const isOwner = userId === task.createdBy;

    if (!isAdmin && !isOwner) {
      return next(
        new AppError(
          "You do not have permission to access or modify this task",
          403,
        ),
      );
    }

    next();
  },
);
