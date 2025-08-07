'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface FileItem {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  category: string;
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

const MyFiles = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'image' | 'video' | 'document' | 'audio' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
   const [deleting, setDeleting] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle opening the preview modal and logging file data
  const handlePreview = (file: FileItem) => {
    console.log("Selected file for preview:", file); // DEBUGGING LINE
    setSelectedFile(file);
  };

    const deleteFile = async (file: FileItem) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/delete?blobName=${encodeURIComponent(file.name)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove file from state
        setFiles(prevFiles => prevFiles.filter(f => f.name !== file.name));
        setFileToDelete(null);
       
      } else {
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/getfile', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
      } else {
        console.error('Error fetching files:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

    const downloadFile = (file: FileItem) => {
    const fileName = file.metadata?.originalName || file.name.split('/').pop() || 'file';
    const downloadUrl = `/api/download?blobName=${encodeURIComponent(file.name)}&fileName=${encodeURIComponent(fileName)}`;

    window.open(downloadUrl, '_blank');
  };


  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          await fetchFiles(); // Re-fetch to get updated list
        } else {
          const errorData = await response.json();
          console.error('Upload failed:', errorData.message || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Handle right-click for context menu
  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, file });
  };

  // Filter and sort files
  const filteredAndSortedFiles = files
    .filter(file => {
      if (filterBy === 'all') return true;
      return getCorrectCategory(file) === filterBy;
    })
    .filter(file => 
      file.metadata?.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.metadata?.originalName || a.name).localeCompare(b.metadata?.originalName || b.name);
        case 'size':
          return b.size - a.size;
        case 'date':
          return new Date(b.metadata?.uploadDate || b.lastModified).getTime() - 
                 new Date(a.metadata?.uploadDate || a.lastModified).getTime();
        default:
          return 0;
      }
    });

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
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get file icon based on category
  const getFileIcon = (category: string, extension?: string) => {
    switch (category) {
      case 'image':
        return 'https://img.icons8.com/fluency/48/image.png';
      case 'video':
        return 'https://img.icons8.com/fluency/48/video.png';
      case 'audio':
        return 'https://img.icons8.com/fluency/48/audio.png';
      case 'document':
        if (extension?.includes('pdf')) {
          return 'https://img.icons8.com/color/48/pdf.png';
        }
        return 'https://img.icons8.com/fluency/48/document.png';
      default:
        return 'https://img.icons8.com/fluency/48/file.png';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'image': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'audio': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fix category based on file extension if it's 'other'
  const getCorrectCategory = (file: FileItem) => {
    if (file.category && file.category !== 'other') {
      return file.category;
    }
    
    const extension = file.metadata?.extension?.toLowerCase() || 
                     file.name.split('.').pop()?.toLowerCase() || '';
    
    // Also check filename for extension
    const fileName = (file.metadata?.originalName || file.name).toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(extension) || 
        fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/)) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension) ||
               fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/)) {
      return 'video';
    } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension) ||
               fileName.match(/\.(mp3|wav|flac|aac|ogg|m4a)$/)) {
      return 'audio';
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'csv', 'xlsx', 'ppt', 'pptx'].includes(extension) ||
               fileName.match(/\.(pdf|doc|docx|txt|rtf|csv|xlsx|ppt|pptx)$/)) {
      return 'document';
    } else {
      return 'other';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Files</h1>
          <p className="text-gray-600">{filteredAndSortedFiles.length} file{filteredAndSortedFiles.length !== 1 ? 's' : ''} found</p>
        </div>
        
        {/* Upload Button */}
        <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Files'}
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>


          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
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
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filteredAndSortedFiles.length > 0 ? (
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedFiles.map((file, index) => (
                      <tr 
                        key={index} 
                        className="hover:bg-gray-50"
                        onContextMenu={(e) => handleContextMenu(e, file)}
                      >
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePreview(file)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Image
                                src={getFileIcon(getCorrectCategory(file), file.metadata?.extension)}
                                alt="File Icon"
                                width={40}
                                height={40}
                                className="h-10 w-10"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {/* Show first 10 chars, ellipsis, last 6 chars if name is long */}
                          {(() => {
                            const name = file.metadata?.originalName || file.name;
                            if (name.length > 22) {
                            return `${name.slice(0, 10)}...${name.slice(-6)}`;
                            }
                            return name;
                          })()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {file.metadata?.extension?.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(getCorrectCategory(file))}`}>
                            {getCorrectCategory(file).charAt(0).toUpperCase() + getCorrectCategory(file).slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(file.metadata?.uploadDate || file.lastModified)}
                        </td>
  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
    <button
      onClick={() => setSelectedFile(file)}
      className="text-blue-600 hover:text-blue-900 mr-3"
    >
      View
    </button>
    <button
      onClick={() => downloadFile(file)}
      className="text-green-600 hover:text-green-900 mr-3"
    >
      Download
    </button>
    <button
      onClick={() => setFileToDelete(file)}
      className="text-red-600 hover:text-red-900"
    >
      Delete
    </button>
  </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredAndSortedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group relative"
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div 
                    className="relative h-32 bg-gray-50 flex items-center justify-center cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  >
                    {getCorrectCategory(file) === 'image' ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={file.url}
                          alt={file.metadata?.originalName || file.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized={true}
                          onError={(e) => {
                            console.error('Grid image failed to load:', file.url);
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex flex-col items-center justify-center h-full bg-gray-200 text-gray-500">
                                  <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span class="text-xs">Image too large</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <Image
                        src={getFileIcon(getCorrectCategory(file), file.metadata?.extension)}
                        alt="File Icon"
                        width={48}
                        height={48}
                        className="h-12 w-12"
                      />
                    )}

                    {/* Category Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${getCategoryColor(getCorrectCategory(file))}`}>
                      {file.metadata?.extension?.toUpperCase() || getCorrectCategory(file).toUpperCase()}
                    </div>

                    {/* Hover overlay with action buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                          }}
                          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(file);
                          }}
                          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                          title="Download"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 16l7 7 7-7M12 3v12m0 0l-3-3m3 3l3-3" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileToDelete(file);
                          }}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 truncate text-sm mb-1">
                      {file.metadata?.originalName || file.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-500">{formatDate(file.metadata?.uploadDate || file.lastModified)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}


            {fileToDelete && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Delete File?</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete &quot;{fileToDelete.metadata?.originalName || fileToDelete.name}&quot;?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setFileToDelete(null)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={() => deleteFile(fileToDelete)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-blue-100 rounded-full p-6 mx-auto mb-4 w-fit">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No files found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterBy !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Upload your first file to get started'
            }
          </p>
          
          <label className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-2 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFile(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl text-gray-800  truncate">
                {selectedFile.metadata?.originalName || selectedFile.name}
              </h2>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
              {(() => {
                const ext = selectedFile.metadata?.extension?.toLowerCase() || 
                           selectedFile.name.split('.').pop()?.toLowerCase() || '';
                const url = selectedFile.url;
                const correctCategory = getCorrectCategory(selectedFile);

                if (correctCategory === 'image') {
                  // Check if image is too large (over 10MB)
                  const isLargeImage = selectedFile.size > 10 * 1024 * 1024;
                  
                  if (isLargeImage) {
                    return (
                      <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300">
                        <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-blue-700 font-semibold mb-2">Large Image File</p>
                        <p className="text-blue-600 text-sm mb-1">Size: {formatFileSize(selectedFile.size)}</p>
                        <p className="text-blue-500 text-sm mb-4 text-center">Image is too large for preview</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => downloadFile(selectedFile)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                          <a
                            href={selectedFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open in Tab
                          </a>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-2xl">
                        <Image
                          src={url}
                          alt={selectedFile.metadata?.originalName || selectedFile.name}
                          width={800}
                          height={600}
                          style={{ objectFit: "contain", width: "100%", height: "auto", maxHeight: "70vh" }}
                          className="rounded-lg"
                          unoptimized={true}
                          priority={true}
                          onLoadingComplete={() => {
                            console.log('Image loaded successfully');
                          }}
                          onError={(e) => {
                            console.error('Large image failed to load:', e);
                            // Fallback for failed images
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                                  <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p class="text-gray-600 font-medium">Image too large to display</p>
                                  <p class="text-gray-500 text-sm mt-1">File size: ${formatFileSize(selectedFile.size)}</p>
                                  <p class="text-gray-500 text-sm mt-2">Download to view full image</p>
                                  <button onclick="window.open('${url}', '_blank')" class="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                    Open in New Tab
                                  </button>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                } else if (correctCategory === 'video') {
                  return (
                    <video controls className="w-full max-h-[70vh] rounded-lg">
                      <source src={url} />
                      Your browser does not support the video tag.
                    </video>
                  );
                } else if (correctCategory === 'audio') {
                  return (
                    <audio controls className="w-full rounded">
                      <source src={url} />
                      Your browser does not support the audio tag.
                    </audio>
                  );
                } else if (ext === 'pdf' || selectedFile.name.toLowerCase().includes('.pdf')) {
                  return (
                    <div className="w-full">
                      <iframe
                        src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
                        className="w-full h-[70vh] rounded-lg border-none"
                        title="PDF Preview"
                        style={{ minHeight: '500px' }}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        If PDF doesn't load, <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">click here to open in new tab</a>
                      </p>
                    </div>
                  );
                } else if (['txt', 'csv', 'json', 'html', 'js', 'css', 'md'].includes(ext)) {
                  return (
                    <iframe
                      src={url}
                      className="w-full h-[70vh] rounded-lg border bg-gray-50"
                      title="Text Preview"
                    />
                  );
                } else {
                  return (
                    <div className="text-center py-12">
                      {/* File Icon with animation */}
                      <div className="relative mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center shadow-lg">
                          <Image
                            src={getFileIcon(correctCategory, ext)}
                            alt="File Icon"
                            width={64}
                            height={64}
                            className="h-16 w-16"
                          />
                        </div>
                        {/* Decorative ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
                      </div>

                      {/* File info */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {selectedFile.metadata?.originalName || selectedFile.name}
                        </h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                          <p className="text-gray-600 mb-2">Preview not available for this file type</p>
                          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {correctCategory.charAt(0).toUpperCase() + correctCategory.slice(1)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
                              </svg>
                              {formatFileSize(selectedFile.size)}
                            </span>
                            {ext && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {ext.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                          <button
                            onClick={() => downloadFile(selectedFile)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download File
                          </button>
                          
                          <a
                            href={selectedFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold inline-flex items-center justify-center gap-2 shadow-md"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open in New Tab
                          </a>
                        </div>

                        {/* Helpful suggestions */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                          <p className="text-sm text-blue-700 font-medium mb-2">💡 Suggestions:</p>
                          <ul className="text-sm text-blue-600 space-y-1">
                            <li>• Download the file to view it with appropriate software</li>
                            <li>• Use "Open in New Tab" to view in browser if supported</li>
                            {correctCategory === 'document' && (
                              <li>• Try converting to PDF for better web preview</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* File Details */}
              <div className="mt-6 pt-6 border-t flex justify-between gap-6 flex-wrap text-sm">
                <div>
                  <p className="font-semibold text-gray-500">Type</p> 
                  <p>{getCorrectCategory(selectedFile)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Size</p>
                  <p>{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Format</p>
                  <p>{selectedFile.metadata?.extension?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Uploaded</p>
                  <p>{formatDate(selectedFile.metadata?.uploadDate || selectedFile.lastModified)}</p>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-50 bg-white rounded-md shadow-lg w-48 py-1"
        >
          <button
            onClick={() => {
              handlePreview(contextMenu.file);
              setContextMenu(null);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            View
          </button>
          <button
            onClick={() => {
              downloadFile(contextMenu.file);
              setContextMenu(null);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Download
          </button>
          
        </div>
      )}
    </div>
  );
};

export default MyFiles;