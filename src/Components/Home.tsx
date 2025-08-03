import React from 'react'
import Image from 'next/image'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Upload Section */}
      <div className="max-w-4xl mx-auto">
        {/* Main Upload Area */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 p-8 mb-8">
          <div className="text-center">
            {/* Big Upload Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-6 hover:bg-blue-200 transition-colors">
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
              Upload your files
            </h2>
            <p className="text-gray-600 mb-6">
              Drag and drop files here or click to browse
            </p>
            
            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2">
                <Image
                  src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-upload-web-flaticons-lineal-color-flat-icons-7.png"
                  alt="Upload"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                Choose Files
              </button>
              
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2">
                <Image
                  src="https://img.icons8.com/fluency/48/folder-invoices.png"
                  alt="Folder"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                Upload Folder
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Photos */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
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
          </div>

          {/* Videos */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
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
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
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
          </div>

          {/* Cloud Storage */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 mx-auto mb-4 w-fit">
                <Image
                  src="https://img.icons8.com/office/40/storage.png"
                  alt="Cloud"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
              </div>
              <h3 className="font-semibold text-gray-800">Cloud</h3>
              <p className="text-sm text-gray-600">Sync files</p>
            </div>
          </div>
        </div>

        {/* Recent Files Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Files</h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-center py-8">
              No recent files. Start uploading to see your files here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home