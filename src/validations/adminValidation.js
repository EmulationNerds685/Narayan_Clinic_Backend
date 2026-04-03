import { z } from "zod";

const loginAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(5, "Password must be at least 8 characters long"),
  }),
});

const updateAdminSchema = z.object({
  body: z.object({
    currentEmail: z.string().email("Invalid email address"),
    newEmail: z.string().email("Invalid email address").optional(),
    newPassword: z.string().min(5, "Password must be at least 5 characters long").optional(),
  }),
});

export { loginAdminSchema, updateAdminSchema };
