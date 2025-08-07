import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ isLoggedIn: false }, { status: 200 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ isLoggedIn: true, user: decoded }, { status: 200 });
  } catch {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }
}
