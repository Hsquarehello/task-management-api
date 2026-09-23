import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  CreateTaskSchema,
  TaskIdParamSchema,
  UpdateSchema,
} from "../validations/task.validation.js";
import {
  authenticate,
  authorizeRoles,
  isTaskOwnerOrAdmin,
} from "../middlewares/auth.middleware.js";
import { Role } from "../generated/prisma/enums.js";
const router = Router();
const taskController = new TaskController();

router.post(
  "/",
  authenticate,
  validate(CreateTaskSchema),
  taskController.createTask,
);
router.get("/", taskController.getAllTasks);
router.get("/:id", validate(TaskIdParamSchema), taskController.getTaskById);
router.put(
  "/:id",
  validate(UpdateSchema),
  authenticate,
  isTaskOwnerOrAdmin,
  taskController.updateTask,
);

router.delete(
  "/:id",
  validate(TaskIdParamSchema),
  authenticate,
  isTaskOwnerOrAdmin,
  taskController.deleteTask,
);

router.put(
  "/:id/assign",
  validate(TaskIdParamSchema),
  authenticate,
  authorizeRoles(Role.ADMIN),
  taskController.assignTask,
);

export default router;
