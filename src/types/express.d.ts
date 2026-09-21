import { Request } from "express";
import type { Role } from "../generated/prisma/enums";

export interface JwtPayload {
   id: string,
   role: Role
}

export interface AuthRequest extends Request {
   user?: JwtPayload;
}