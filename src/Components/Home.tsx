'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const Home = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Get file category based on file type
  const getFileCategory = (file: File): string => {
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';
    return 'other';
  };

  // Get file extension from filename
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  // Handle folder input change
  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  // Process files
  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(file);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      // Reset after successful upload
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      setUploadProgress(0);
      alert('Upload failed. Please try again.');
    }
  };

  // Upload individual file
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    
    // Add to uploaded files list
    setUploadedFiles(prev => [...prev, {
      ...result.fileInfo,
      url: result.url,
      uploadTime: new Date().toLocaleString()
    }]);

    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Upload Section */}
      <div className="max-w-4xl mx-auto">
        {/* Main Upload Area */}
        <div 
          className={`bg-white rounded-xl shadow-lg border-2 border-dashed transition-all duration-300 p-5 md:p-8 md:mb-8 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            {/*  Upload Icon */}
            <div className="flex justify-center mb-6">
              <div className={`rounded-full p-6 transition-colors ${
                isDragging ? 'bg-blue-200' : 'bg-blue-100 hover:bg-blue-200'
              }`}>
                <Image
                  src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-upload-web-flaticons-lineal-color-flat-icons-7.png"
                  alt="Upload Icon"
                  width={80}
                  height={80}
                  className="h-20 w-20"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isDragging ? 'Drop files here' : 'Upload your files'}
            </h2>
            <p className="text-gray-600 mb-6">
              Drag and drop files here or click to browse
            </p>
            
            {/* Upload Progress */}
            {uploading && (
              <div className="mb-6">
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">Uploading... {Math.round(uploadProgress)}%</p>
              </div>
            )}
            
            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <label className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 cursor-pointer">
                <Image
                  src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-upload-web-flaticons-lineal-color-flat-icons-7.png"
                  alt="Upload"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                Choose Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
              </label>
              
              <label className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 cursor-pointer">
                <Image
                  src="https://img.icons8.com/fluency/48/folder-invoices.png"
                  alt="Folder"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                Upload Folder
                <input
                  type="file"
                  multiple
                  // @ts-expect-error - webkitdirectory is not in standard HTML types
                  webkitdirectory=""
                  className="hidden"
                  onChange={handleFolderInput}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Photos */}
          <label className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 mx-auto mb-4 w-fit">
                <Image
                  src="https://img.icons8.com/fluency/48/image.png"
                  alt="Photos"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
              </div>
              <h3 className="font-semibold text-gray-800">Photos</h3>
              <p className="text-sm text-gray-600">Upload images</p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
              disabled={uploading}
            />
          </label>

          {/* Videos */}
          <label className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-fit">
                <Image
                  src="https://img.icons8.com/fluency/48/video.png"
                  alt="Videos"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
              </div>
              <h3 className="font-semibold text-gray-800">Videos</h3>
              <p className="text-sm text-gray-600">Upload videos</p>
            </div>
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
              disabled={uploading}
            />
          </label>

          {/* Documents */}
          <label className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 mx-auto mb-4 w-fit">
                <Image
                  src="https://img.icons8.com/fluency/48/document.png"
                  alt="Documents"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
              </div>
              <h3 className="font-semibold text-gray-800">Documents</h3>
              <p className="text-sm text-gray-600">Upload docs</p>
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
              multiple
              className="hidden"
              onChange={handleFileInput}
              disabled={uploading}
            />
          </label>

          {/* All Files */}
          <label className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 mx-auto mb-4 w-fit">
                <Image
                  src="https://img.icons8.com/office/40/storage.png"
                  alt="All Files"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
              </div>
              <h3 className="font-semibold text-gray-800">All Files</h3>
              <p className="text-sm text-gray-600">Any file type</p>
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Recent Files Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Files</h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            {uploadedFiles.length > 0 ? (
              <div className="space-y-4">
                {uploadedFiles.slice(-5).reverse().map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        getFileCategory(file) === 'image' ? 'bg-purple-100' :
                        getFileCategory(file) === 'video' ? 'bg-red-100' :
                        getFileCategory(file) === 'document' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-xs font-bold text-gray-600">
                          {getFileExtension(file.name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-semibold">
                      Uploaded ✓
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No recent files. Start uploading to see your files here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;