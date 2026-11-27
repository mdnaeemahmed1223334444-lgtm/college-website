import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Please enter your Student ID, Email or Username"),
  password: z.string().min(1, "Please enter your password"),
});
