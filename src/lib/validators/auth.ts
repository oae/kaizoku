import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  userName: z.string().trim().min(3, "User name should be at least 3 characters.").max(255),
  password: z.string().trim().min(6, "Password should be at least 6 characters.").max(255),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  password: z
    .string()
    .trim()
    .min(6, "Password should be at least 6 characters.")
    .max(255),
});
export type SignInInput = z.infer<typeof signInSchema>;
