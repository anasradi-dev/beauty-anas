import bcrypt from "bcrypt";
import { UserModel } from "@/src/models/beauty-models";
import { createLocalAuthUser, findLocalAuthUser } from "@/lib/local-auth-store";
import { connectMongo } from "@/lib/mongodb";
import type { IAuthInput, ISigninInput } from "@/src/validators/auth-validators";

export type AuthUser = {
  email: string;
  role: "admin" | "user";
};

function toAuthUser(user: { email: string; role: "admin" | "user" }): AuthUser {
  return {
    email: user.email,
    role: user.role,
  };
}

function getSignupRole(adminCode?: string): "admin" | "user" {
  const expectedAdminCode = process.env.ADMIN_SIGNUP_CODE || "ADMIN2026";
  return adminCode && adminCode === expectedAdminCode ? "admin" : "user";
}

function shouldUseMongo() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export const authService = {
  async signupUser(input: IAuthInput) {
    if (!shouldUseMongo()) {
      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await createLocalAuthUser({
        email: input.email,
        passwordHash,
        role: getSignupRole(input.adminCode),
      });

      return toAuthUser(user);
    }

    await connectMongo();
    const existingUser = await UserModel.findOne({ email: input.email }).lean();
    if (existingUser) {
      throw new Error("Email already in use.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await UserModel.create({
      email: input.email,
      passwordHash,
      role: getSignupRole(input.adminCode),
    });

    return toAuthUser(user);
  },

  async signinUser(input: ISigninInput) {
    if (!shouldUseMongo()) {
      const user = await findLocalAuthUser(input.email);
      if (!user) {
        throw new Error("Invalid credentials.");
      }

      const isValidPassword = await bcrypt.compare(
        input.password,
        user.passwordHash,
      );
      if (!isValidPassword) {
        throw new Error("Invalid credentials.");
      }

      return toAuthUser(user);
    }

    await connectMongo();
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const isValidPassword = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new Error("Invalid credentials.");
    }

    return toAuthUser(user);
  },
};

export const signupUser = authService.signupUser.bind(authService);
export const signinUser = authService.signinUser.bind(authService);
