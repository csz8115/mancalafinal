import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string()
    .nonempty("Username cannot be blank")
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username cannot exceed 20 characters")
    .trim(),
  password: z.string()
    .nonempty("Password cannot be blank")
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .trim(),
});

export type LoginState = | {
  errors?: {
    username?: string[]
    password?: string[]
  }
  message?: string
}
  | undefined