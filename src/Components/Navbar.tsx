import React from 'react';
import Image from 'next/image';

const Navbar = () => {
  return (
    <div>
      <nav className='flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 py-2'>
        {/* upload button - improved styling */}
        <div className='flex items-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105 hover:shadow-md'>
          <Image
            src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-upload-web-flaticons-lineal-color-flat-icons-7.png"
            alt="Upload Icon"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <p className='text-blue-700 font-semibold text-base'>Upload</p>
        </div>

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
        
        {/* search section */}
        <div className="flex items-center gap-2 w-full sm:w-auto max-w-md">
          <input 
            type="text" 
            placeholder="Search photos and videos..." 
            className="search-input flex-1 sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button className="search-button bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Search
          </button>
        </div>

        {/* profile section */}
        <div className='flex items-center border border-gray-300 rounded-full p-1 hover:bg-gray-100 cursor-pointer transition-colors'>
          <Image 
            src="/un.png"
            alt="User Profile" 
            width={32} 
            height={32} 
            className='h-8 w-8 rounded-full'
          />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;