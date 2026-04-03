import { z } from "zod";

const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(4, "OTP must be 4 digits"),

  }),
});

export { sendOtpSchema, verifyOtpSchema };
