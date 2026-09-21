import { prisma } from "../libs/prisma.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterOptions,
} from "../validations/task.validation.js";
import type { Task } from "../generated/prisma/client.js";
import { Prisma } from "../generated/prisma/client.js";

// 1. Reusable Relation Selection
const userSelect = {
  select: { id: true, name: true, email: true },
};

const taskInclude = {
  creator: userSelect,
  assignee: userSelect,
} satisfies Prisma.TaskInclude;

// 2. Exact Type Definition for Return Values
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof taskInclude;
}>;

export class TaskRepository {
  async create(
    data: CreateTaskInput,
    currentUserId: string,
  ): Promise<TaskWithRelations> {
    return prisma.task.create({
      data: {
        ...data,
        createdBy: currentUserId,
      },
      include: taskInclude,
    });
  }

  async findById(id: string): Promise<TaskWithRelations | null> {
    return prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });
  }

  async findAllByUser(userId: string): Promise<TaskWithRelations[]> {
    return prisma.task.findMany({
      where: { createdBy: userId },
      include: taskInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async findMany(
    filters: TaskFilterOptions,
  ): Promise<{ data: TaskWithRelations[]; total: number }> {
    const { status, priority, assigneeId, createdBy, search, page, limit } =
      filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(createdBy && { createdBy }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: taskInclude,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      total,
    };
  }

  async update(id: string, data: UpdateTaskInput): Promise<TaskWithRelations> {
    return prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }
}
