'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';



interface VideoFile {
  name: string;
  url: string;
  size: number;
  downloadUrl: string;
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

const Videos = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoFile | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      // Window focus এ videos refresh করুন
      fetchVideos();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/getfile?category=video');
      const data = await response.json();
      console.log('data is', data);
      
      if (data.success) {
        setVideos(data.files);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };


  const downloadVideo = (video: VideoFile) => {
    const fileName = video.metadata?.originalName || video.name.split('/').pop() || 'video';
    const downloadUrl = `/api/download?blobName=${encodeURIComponent(video.name)}&fileName=${encodeURIComponent(fileName)}`;

    window.open(downloadUrl, '_blank');
  };
  
  // Delete video function
  const deleteVideo = async (video: VideoFile) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/delete?blobName=${encodeURIComponent(video.name)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove video from state
        setVideos(prevVideos => prevVideos.filter(v => v.name !== video.name));
        setVideoToDelete(null);
      } else {
        console.error('Failed to delete:', data.error);
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setDeleting(false);
    }
  };





  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
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
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-3"></div>
        <p className="text-indigo-600 font-medium">Loading your videos...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* upload  */}
      

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
          {videos.map((video, index) => (
            <div key={index} className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:scale-[1.02]">
              {/* Video Thumbnail */}
              <div 
                className="relative h-48 bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Video Icon */}
                <div className="flex flex-col items-center justify-center text-indigo-600">
                  <svg className="w-16 h-16 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-sm font-medium text-indigo-700">Click to Play</p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                </div>
                
                {/* File extension badge */}
                <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
                  {video.metadata?.extension?.toUpperCase() || 'VIDEO'}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 truncate mb-2 text-lg">
                  {video.metadata?.originalName || video.name}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 15l5-3-5-3v6z"></path>
                    </svg>
                    Size: {formatFileSize(video.size)}
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {formatDate(video.metadata?.uploadDate || video.lastModified)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5">
                </div>
                <button
                  onClick={() => setVideoToDelete(video)}
                  className="w-full mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium text-center py-1 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => downloadVideo(video)}
                  className="w-full mt-3 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium text-center py-1 rounded-md transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-b from-white to-indigo-50 rounded-2xl shadow-sm border border-indigo-100">
          <div className="bg-indigo-100 rounded-full p-6 mx-auto mb-6 w-fit shadow-md">
            <Image
              src="https://img.icons8.com/fluency/96/video.png"
              alt="No Videos"
              width={80}
              height={80}
              className="h-20 w-20"
            />
          </div>
          <h3 className="text-2xl font-semibold text-indigo-800 mb-3">No videos found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">There are no videos available in your account. Upload your first video to see it here.</p>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-white">

              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-indigo-700 text-2xl font-bold h-10 w-10 flex items-center justify-center rounded-full hover:bg-indigo-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Video Player */}
            <div className="p-6">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <video
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] bg-black"
                  src={selectedVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-indigo-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"></path>
                    </svg>
                    <strong>Size:</strong> {formatFileSize(selectedVideo.size)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <strong>Uploaded:</strong> {formatDate(selectedVideo.metadata?.uploadDate || selectedVideo.lastModified)}
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => downloadVideo(selectedVideo)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7m14 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9m14 0H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V11a2 2 0 00-2-2z" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {videoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center mb-4 text-indigo-800">
              <svg className="w-8 h-8 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold">Delete Video?</h3>
            </div>
            <p className="text-gray-600 mb-6 bg-indigo-50 p-3 rounded-lg">
              Are you sure you want to delete &quot;<span className="font-semibold text-indigo-700">{videoToDelete.metadata?.originalName || videoToDelete.name}</span>&quot;?
              <br /><span className="text-indigo-800 font-medium">This action cannot be undone.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2 text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors duration-300"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteVideo(videoToDelete)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;