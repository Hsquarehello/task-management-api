import { z } from "zod";

// Task Status & Priority
const TaskStatus = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]);
const Priority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const CreateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().optional(),
    status: TaskStatus.default("TODO").optional(),
    priority: Priority.default("MEDIUM").optional(),
    dueDate: z
      .string()
      .datetime({ message: "Invalid ISO date string" })
      .optional(),
    // createdBy: z.string().uuid("Invalid creator ID format"),
    assigneeId: z.string().uuid("Invalid Assignee UUID").optional(),
  }),
});

export const UpdateTaskSchema = z.object({
  body: CreateTaskSchema.shape.body.partial(),
});

export const TaskFilterSchema = z.object({
  query: z.object({
    status: TaskStatus.optional(),
    priority: Priority.optional(),
    assigneeId: z.string().uuid().optional(),
    createdBy: z.string().uuid().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const TaskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid task ID format"),
  }),
});

export const UpdateSchema = z.object({
  ...UpdateTaskSchema.shape,
  ...TaskIdParamSchema.shape,
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>["body"];
export type TaskFilterOptions = z.infer<typeof TaskFilterSchema>["query"];
export type TaskIdParam = z.infer<typeof TaskIdParamSchema>["params"];
