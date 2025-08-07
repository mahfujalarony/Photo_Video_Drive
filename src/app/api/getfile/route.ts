import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
const CONTAINER_NAME = 'drive'; 

// Get current user from JWT token
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || "jwt_secret") as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // List blobs for current user
    const prefix = category 
      ? `users/${user.userId}/${category}/`
      : `users/${user.userId}/`;

    const files = [];
    
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
      
      files.push({
        name: blob.name,
        url: blockBlobClient.url,
        size: blob.properties.contentLength,
        lastModified: blob.properties.lastModified,
        metadata: blob.metadata,
        category: blob.metadata?.category || 'other'
      });
    }

    return NextResponse.json({ 
      success: true, 
      files: files.sort((a, b) => new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime())
    });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json({ error: 'Failed to get files' }, { status: 500 });
  }
}