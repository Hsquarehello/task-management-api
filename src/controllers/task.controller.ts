import type { Response } from "express";
import type { AuthRequest } from "../types/express.js";
import { TaskService } from "../services/task.service.js";
import { type TaskFilterOptions } from "../validations/task.validation.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  createTask = asyncHandler(
    async (
      req: AuthRequest,
      res: Response,
    ): Promise<void> => {
      const validatedData = req.body;
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }
      const userId = req.user.id;
      const task = await this.taskService.createTask(userId, validatedData);
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    },
  );

  getAllTasks = asyncHandler(
    async (
      req: AuthRequest,
      res: Response,
    ): Promise<void> => {
      const page = Number(req.query.page) || 1;
      const limit = 10;
      const filterOptions: TaskFilterOptions = {
        page,
        limit,
      };
      const { data: tasks, total } =
        await this.taskService.getAllTasks(filterOptions);
      res.status(200).json({
        success: true,
        message: "Task fetched successfully",
        data: tasks,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    },
  );

  getTasks = asyncHandler(
    async (
      req: AuthRequest,
      res: Response,
    ): Promise<void> => {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const userId = req.user.id;
      const tasks = await this.taskService.getTasksByUser(userId);
      res.status(200).json({
        success: true,
        message: "Task fetched successfully",
        data: tasks,
      });
    },
  );

  getTaskById = asyncHandler(
    async (
      req: AuthRequest,
      res: Response,
    ): Promise<void> => {
      const id = req.params.id as string;

      const task = await this.taskService.getTaskById(id);
      res.status(200).json({ success: true, message: "Get task", data: task });
    },
  );

  updateTask = asyncHandler(
    async (
      req: AuthRequest,
      res: Response,
    ): Promise<void> => {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }
      const id = req.params.id as string;
      const validatedData = req.body;

      const updatedTask = await this.taskService.updateTask(id, validatedData);
      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: updatedTask,
      });
    },
  );

  deleteTask = asyncHandler(
    async (
      req: AuthRequest,
      res: Response,
    ): Promise<void> => {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const id = req.params.id as string;

      await this.taskService.deleteTask(id);
      res
        .status(200)
        .json({ success: true, message: "Task deleted successfully" });
    },
  );
}
