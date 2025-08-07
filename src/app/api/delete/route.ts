import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
const CONTAINER_NAME = "drive";

// Get current user from JWT token
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || "jwt_secret") as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Extract blobName from query parameters
    const { searchParams } = new URL(request.url);
    const blobName = searchParams.get('blobName');
    
    if (!blobName) {
      return NextResponse.json({ error: "No file specified" }, { status: 400 });
    }

    // Verify the file belongs to the user
    if (!blobName.includes(`users/${user.userId}/`)) {
      return NextResponse.json({ error: "Unauthorized to delete this file" }, { status: 403 });
    }

    // Initialize Azure Blob Storage client
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if the blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete the blob
    await blockBlobClient.delete();

    return NextResponse.json({ 
      success: true, 
      message: "File deleted successfully",
      deletedFile: blobName
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}