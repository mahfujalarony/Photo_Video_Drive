import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
const CONTAINER_NAME = 'drive'; 

// File type detection function
function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  } else if (
    mimeType.includes('pdf') || 
    mimeType.includes('document') || 
    mimeType.includes('text/') ||
    mimeType.includes('application/msword') ||
    mimeType.includes('application/vnd.openxmlformats-officedocument')
  ) {
    return 'document';
  } else {
    return 'other';
  }
}

// Get file extension
function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Get current user from JWT token
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || "jwt_secret") as jwt.JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    // File information
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      category: getFileCategory(file.type),
      extension: getFileExtension(file.name),
      uploadDate: new Date().toISOString(),
      userId: user.userId,
      userEmail: user.email
    };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // Create user-specific folder structure
    const blobName = `users/${user.userId}/${fileInfo.category}/${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload with user-specific metadata AND Content-Disposition so downloads attach
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type,
        // for downloading files browser
        blobContentDisposition: `attachment; filename="${file.name}"`
      },
      metadata: {
        originalName: file.name,
        category: fileInfo.category,
        extension: fileInfo.extension,
        uploadDate: fileInfo.uploadDate,
        size: file.size.toString(),
        userId: user.userId.toString(),
        userEmail: user.email,
        uploadedBy: user.name || user.email
      }
    });

    const blobUrl = blockBlobClient.url;

    return NextResponse.json({ 
      success: true, 
      url: blobUrl,
      fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}