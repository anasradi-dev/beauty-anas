import { z } from "zod";

export const authSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  adminCode: z.string().trim().optional(),
});

export const signinSchema = authSchema.omit({ adminCode: true });

export type IAuthInput = z.infer<typeof authSchema>;
export type ISigninInput = z.infer<typeof signinSchema>;
