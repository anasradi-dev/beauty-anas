import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type LocalAuthUser = {
  email: string;
  passwordHash: string;
  role: "admin" | "user";
};

const storeDirectory = path.join(process.cwd(), "data");
const storePath = path.join(storeDirectory, "auth-users.json");

async function saveUsers(users: LocalAuthUser[]) {
  await mkdir(storeDirectory, { recursive: true });
  await writeFile(storePath, JSON.stringify(users, null, 2), "utf8");
}

async function loadUsers() {
  try {
    const content = await readFile(storePath, "utf8");
    return JSON.parse(content) as LocalAuthUser[];
  } catch {
    await saveUsers([]);
    return [];
  }
}

export async function findLocalAuthUser(email: string) {
  const users = await loadUsers();
  return users.find((user) => user.email === email) || null;
}

export async function createLocalAuthUser(user: LocalAuthUser) {
  const users = await loadUsers();
  const normalizedUser = { ...user, email: user.email.toLowerCase() };

  if (users.some((item) => item.email === normalizedUser.email)) {
    throw new Error("Email already in use.");
  }

  await saveUsers([...users, normalizedUser]);
  return normalizedUser;
}
