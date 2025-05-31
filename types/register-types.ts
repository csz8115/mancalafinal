import { z } from "zod";

export const RegisterSchema = z.object({
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
  confirmPassword: z.string()
    .nonempty("Confirm Password cannot be blank")
    .min(8, "Confirm Password must be at least 8 characters")
    .max(50, "Confirm Password cannot exceed 50 characters")
    .trim()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
});

export type RegisterState = | {
  errors?: {
    username?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
  message?: string
}
  | undefined;