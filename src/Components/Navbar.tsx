'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [completedFiles, setCompletedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setShowNotification(true);
    setUploadProgress(0);
    setCompletedFiles(0);
    setTotalFiles(fileArray.length);

    try {
      let completedUploads = 0;
      
      for (const file of fileArray) {
        setCurrentFileName(file.name);
        
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload failed:', errorData.message || 'Unknown error');
        } else {
          completedUploads++;
          setCompletedFiles(completedUploads);
          setUploadProgress((completedUploads / fileArray.length) * 100);
        }
      }
      
      setCurrentFileName('Upload Complete!');
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
    } catch (error) {
      setCurrentFileName('Upload Failed!');
      setTimeout(() => setShowNotification(false), 5000);
    } finally {
      setUploading(false);
    }
  };

const handleLogout = async () => {
  setShowConfirmModal(false);
  try {
    const response = await fetch('/api/logout', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      // Clear any client-side data if needed
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to auth page
      router.push('/auth');
      router.refresh(); // Force refresh to clear any cached data
    } else {
      const errorData = await response.json();
      console.error('Logout failed:', errorData.message || 'Unknown error');
    }
  } catch (error) {
    console.error('An error occurred during logout:', error);
   
    router.push('/auth');
  }
};
    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
      e.target.value = ''; 
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all duration-300 ${dragOver ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''}`}
    >
      
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm w-full mx-4 z-50 animate-slide-up">
          <div className="flex items-start gap-3">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 flex-shrink-0 mt-1"></div>
            ) : (
              <div className="rounded-full h-6 w-6 bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                {uploading ? 'Uploading Files...' : 'Upload Complete!'}
              </h4>
              <p className="text-xs text-gray-600 mb-2 truncate" title={currentFileName}>
                {uploading ? `Current: ${currentFileName}` : `${completedFiles} files uploaded successfully`}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    uploading ? 'bg-blue-600' : 'bg-green-500'
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{completedFiles}/{totalFiles} files</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-1"
              title="Hide notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
       
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {dragOver && (
        <div className="fixed inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-dashed border-blue-400">
            <div className="text-center">
              <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Drop Files Here</h3>
              <p className="text-blue-600">Release to upload your files</p>
            </div>
          </div>
        </div>
      )}

      <nav className='flex  sm:flex-row justify-between items-center gap-4 sm:gap-0 py-2'>
        <label className={`flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
          uploading 
            ? 'bg-gray-100 border border-gray-300' 
            : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
        }`}>
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          ) : (
            <Image
              src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-upload-web-flaticons-lineal-color-flat-icons-7.png"
              alt="Upload Icon"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          )}
          <p className={`font-semibold text-base ${
            uploading ? 'text-gray-600' : 'text-blue-700'
          }`}>
            {uploading ? 'Uploading...' : 'Upload'}
          </p>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleInputChange}
            disabled={uploading}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx"
          />
        </label>

        {/* cloud button - consistent styling */}
        <div className='flex items-center gap-2 cursor-pointer bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105 hover:shadow-md'>
          <Image 
            src="https://img.icons8.com/office/40/storage.png" 
            alt="Storage Icon" 
            height={24}
            width={24}
            className="h-6 w-6"
          />
          <p className='text-green-700 font-semibold text-base'>Cloud</p>
        </div>


        {/* profile section */}
        <div className='relative' ref={profileMenuRef}>
          <div 
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className='flex items-center border border-gray-300 rounded-full p-1 hover:bg-gray-100 cursor-pointer transition-colors'
          >
            <Image 
              src="/un.png"
              alt="User Profile" 
              width={32} 
              height={32} 
              className='h-8 w-8 rounded-full'
            />
          </div>

          {showLogoutMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      </nav>
    </div>
  );
};

export default Navbar;