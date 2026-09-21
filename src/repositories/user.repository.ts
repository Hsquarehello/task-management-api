import { Prisma } from "../generated/prisma/client.js";
import type { User } from "../generated/prisma/client.js";
import { prisma } from "../libs/prisma.js";
import type { RegisterInput } from "../validations/user.validation.js";

const userWithoutPasswordSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserWithoutPassword = Prisma.UserGetPayload<{
  select: typeof userWithoutPasswordSelect;
}>;

export type UserWithTasks = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    role: true;
    createdTasks: { take: 5; orderBy: { createdAt: "desc" } };
    assignedTasks: {
      where: { status: { not: "COMPLETED" } };
      orderBy: { dueDate: "asc" };
    };
  };
}>;

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: RegisterInput): Promise<UserWithoutPassword> {
    return prisma.user.create({
      data,
      select: userWithoutPasswordSelect,
    });
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userWithoutPasswordSelect,
    });
  }

  async findWithTasks(id: string): Promise<UserWithTasks | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdTasks: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        assignedTasks: {
          where: { status: { not: "COMPLETED" } },
          orderBy: { dueDate: "asc" },
        },
      },
    });
  }
}
