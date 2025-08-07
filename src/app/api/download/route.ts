import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const AZURE_CONNECTION = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
const CONTAINER_NAME = 'drive';

// ckk user login authentication
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) return null;
    return jwt.verify(token.value, process.env.JWT_SECRET || "jwt_secret") as any;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    // ckk user login authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get blob name and file name from query parameters
    const { searchParams } = new URL(req.url);
    const blobName = searchParams.get('blobName');
    const fileName = searchParams.get('fileName') || blobName?.split('/').pop() || 'file';

    if (!blobName) {
      return NextResponse.json({ error: 'Missing blobName parameter' }, { status: 400 });
    }

    // Azure connection
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlockBlobClient(blobName);
    
    try {
      // Download the blob
      const downloadResponse = await blobClient.download();
      
      // header for download
      const headers = new Headers();
      headers.set('Content-Type', downloadResponse.contentType || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

      // Return the stream
      if (!downloadResponse.readableStreamBody) {
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
      }

      return new NextResponse(downloadResponse.readableStreamBody as any, {
        headers
      });
    } catch (error: any) {
      console.error('Download error:', error);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}