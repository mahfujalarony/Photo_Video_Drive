import React from 'react';
import Image from 'next/image';

const Navbar = () => {
  return (
    <div>
      <nav className='flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 py-2'>
        <div className='flex items-center gap-2 cursor-pointer'>
          <Image 
            src="https://img.icons8.com/office/40/storage.png" 
            alt="Storage Icon" 
            height={32}
            width={32}
            className="h-8 w-8"
          />
          <p className='text-lg font-bold'>Cloud</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto max-w-md">
          <input 
            type="text" 
            placeholder="Search photos and videos..." 
            className="search-input flex-1 sm:w-64"
          />
          <button className="search-button">Search</button>
        </div>

        <div className='flex items-center border border-gray-300 rounded-full p-1 hover:bg-gray-100 cursor-pointer'>
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