import { z } from "zod";
import { Role } from "../generated/prisma/enums";

export const UserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password is too long"),
   role: z.enum(Role).optional()
});

export const LoginSchema = z.object({
   email: z.string().email("Invalid email address"),
   password: z.string().min(1, "Password is required")
})

export type UserInput = z.infer<typeof UserSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
