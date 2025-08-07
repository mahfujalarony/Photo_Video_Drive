// src/lib/isLogin.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function isLogin() {
    const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwt_secret");
    return decoded;
  } catch {
    return null;
  }
}

