import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository.js";
import type {
  RegisterInput,
  LoginInput,
} from "../validations/user.validation.js";
import type { Role } from "../generated/prisma/enums.js";
import { AppError } from "../utils/appError.js";
import type { UserWithoutPassword } from "../repositories/user.repository.js";

export interface AuthResponse {
  user: UserWithoutPassword;
  token: string;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private generateToken(id: string, role: Role): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("JWT_SECRET is not configured on the server", 500);
    }
    return jwt.sign({ id, role }, secret, {
      expiresIn: "7d",
    });
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email is already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id, user.role);

    return {
      user,
      token,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError("Invalid email or password", 400);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 400);
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user,
      token,
    };
  }
}
