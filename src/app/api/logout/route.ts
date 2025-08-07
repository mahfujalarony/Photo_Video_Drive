import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the token cookie with the same settings as when it was set
    cookieStore.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, 
    });

    return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}