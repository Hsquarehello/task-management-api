import {
  TaskRepository,
  type TaskWithRelations,
} from "../repositories/task.repository.js";
import type {
  CreateTaskInput,
  TaskFilterOptions,
  UpdateTaskInput,
} from "../validations/task.validation.js";
import type { Task } from "../generated/prisma/client.js";
import { AppError } from "../utils/appError.js";
import { prisma } from "../libs/prisma.js";

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async createTask(userId: string, data: CreateTaskInput): Promise<Task> {
    return this.taskRepository.create(data, userId);
  }

  async getAllTasks(
    filterOptions: TaskFilterOptions,
  ): Promise<{ data: Task[]; total: number }> {
    return this.taskRepository.findMany(filterOptions);
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return this.taskRepository.findAllByUser(userId);
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError("Task not found", 404);
    }
    return task;
  }

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    return this.taskRepository.update(id, data);
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }

  async assignTask(
    taskId: string,
    assigneeId: string,
  ): Promise<TaskWithRelations> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: assigneeId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return await this.taskRepository.assignTask(taskId, assigneeId);
  }
}
