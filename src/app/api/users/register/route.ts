import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";


//user registation with name, email, and password
export async function POST(request: NextRequest) {
    const { name, email, password } = await request.json();
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds); 
    
    
    if (!name || !email || !password) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    
    try {
        const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
        });
        //create a JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "jwt_secret", { expiresIn: "7d" });

        // Set the token in cookies
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({ message: "User created successfully", user, token }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}


