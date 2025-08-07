'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

interface PhotoFile {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  metadata: {
    originalName: string;
    category: string;
    extension: string;
    uploadDate: string;
    size: string;
    userId: string;
    userEmail: string;
  };
}

const Photos = () => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoFile | null>(null);
 // const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated) {
      fetchPhotos();
    }
  }, [hydrated]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/getfile?category=image', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPhotos(data.files);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = (photo: PhotoFile) => {
    const fileName = photo.metadata?.originalName || photo.name.split('/').pop() || 'photo';
    const downloadUrl = `/api/download?blobName=${encodeURIComponent(photo.name)}&fileName=${encodeURIComponent(fileName)}`;
    

    window.open(downloadUrl, '_blank');
  };


  if (!hydrated) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }



  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    //setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          await fetchPhotos();
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      //setUploading(false);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              List
            </button>

            {/* upload */}
            <label className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
              <Image
                src="https://img.icons8.com/fluency/48/image.png"
                alt="Upload"
                width={20}
                height={20}
                className="h-5 w-5 inline-block mr-2"
              />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        </div>
      </div>
      {/* Photos Display */}
      {photos.length > 0 ? (
        <>
          {/* Grid View - Fixed */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image Container - Fixed */}
                  <div 
                    className="relative w-full aspect-square bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.metadata?.originalName || photo.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      unoptimized={true}
                      priority={index < 6} // Prioritize first 6 images
                      onError={(e) => {
                        console.error('Image load error:', photo.url);
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = '/image-placeholder.png';
                        target.parentElement?.classList.add('bg-gray-200');
                      }}
                    />
                    
                    {/* File extension badge */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                      {photo.metadata?.extension?.toUpperCase() || 'IMG'}
                    </div>
                  </div>

                  {/* Photo Info */}
                    <div className="p-3">
                   <h3 className="font-semibold text-gray-900 truncate text-base mb-2">
                      {photo.metadata?.originalName || photo.name}
                    </h3>
                    <div className="flex justify-between items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {formatFileSize(photo.size)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            downloadPhoto(photo);
                          }}
                          className="p-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                          aria-label="Download photo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {photos.map((photo, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <Image
                              src={photo.url}
                              alt={photo.metadata?.originalName || photo.name}
                              width={64}
                              height={64}
                              className="object-cover"
                              sizes="64px"
                              unoptimized={true}
                            />
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <div className="text-sm font-medium text-gray-900">
                          {/* Show first 10 chars, ellipsis, last 6 chars if name is long */}
                          {(() => {
                            const name = photo.metadata?.originalName || photo.name;
                            if (name.length > 22) {
                            return `${name.slice(0, 10)}...${name.slice(-6)}`;
                            }
                            return name;
                          })()}
                          </div>
                          <div className="text-sm text-gray-500">
                          {photo.metadata?.extension?.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(photo.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(photo.metadata?.uploadDate || photo.lastModified)}
                        </td>
                        <td className="px-6 py-4 space-x-10 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto(photo);
                            }}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                          >
                            View
                          </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            downloadPhoto(photo);
                          }}
                          className="p-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                          aria-label="Download photo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-purple-100 rounded-full p-6 mx-auto mb-4 w-fit">
            <Image
              src="https://img.icons8.com/fluency/96/image.png"
              alt="No Photos"
              width={80}
              height={80}
              className="h-20 w-20"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No photos found</h3>
          <p className="text-gray-600 mb-6">Upload your first photo to get started</p>
          
          <label className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold inline-flex items-center gap-2 cursor-pointer">
            <Image
              src="https://img.icons8.com/fluency/48/image.png"
              alt="Upload"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            Upload Your First Photo
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="relative w-full h-full max-w-7xl max-h-full flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.metadata?.originalName || selectedPhoto.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                  unoptimized={true}
                  onError={(e) => {
                    console.error('Large image failed to load:', e);
                  }}
                />
              </div>
            </div>

            {/* Info Panel - Responsive */}
            <div className="bg-black bg-opacity-80 text-white p-3 sm:p-4 backdrop-blur-sm">
              <h3 className="text-sm sm:text-lg font-semibold mb-2 truncate">
                {selectedPhoto.metadata?.originalName || selectedPhoto.name}
              </h3>
              
              {/* File Details - Stack on mobile, flex on desktop */}
              <div className="flex flex-col sm:flex-row sm:gap-6 gap-1 text-xs sm:text-sm mb-3">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Size: {formatFileSize(selectedPhoto.size)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Format: {selectedPhoto.metadata?.extension?.toUpperCase()}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Uploaded: </span>
                  {formatDate(selectedPhoto.metadata?.uploadDate || selectedPhoto.lastModified)}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="bg-purple-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
                

              </div>
            </div>
          </div>
        </div>
      )}<br />
    </div>
  );
};

export default Photos;