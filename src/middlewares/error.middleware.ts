import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("ERROR 💥:", err);

  let error = err;

  // 1. Zod Validation Error ဖမ်းယူခြင်း
  if (err instanceof ZodError) {
    const message = err.issues.map((e) => e.message).join(", ");
    error = new AppError(`Invalid Input: ${message}`, 400);
  }

  // 2. Prisma Database Errors ဖမ်းယူခြင်း
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2025: Record to delete/update not found
    if (err.code === "P2025") {
      error = new AppError("Requested resource not found", 404);
    }
    // P2002: Unique constraint violation (e.g. Username တူနေခြင်း)
    else if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      error = new AppError(`Duplicate value for: ${target}`, 400);
    } else {
      error = new AppError("Database operation failed", 400);
    }
  }

  // 3. JWT Token Errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please log in again.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired. Please log in again.", 401);
  }

  // Response ပြန်လည် ပေးပို့ခြင်း
  const statusCode = error.statusCode || 500;
  const status = `${statusCode}`.startsWith("4") ? "fail" : "error";

  // Development Environment ဆိုလျှင် Stack Trace ပါ ပြသမည်
  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      status,
      message: error.message,
      error: err,
      stack: err.stack,
    });
    return;
  }

  if (error.isOperational) {
    // သိရှိပြီးသား Operational Errors (AppError မှလာသော Error များ)
    res.status(statusCode).json({
      status,
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
}
