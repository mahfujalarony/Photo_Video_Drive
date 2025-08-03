'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '@/Components/Navbar';
import Home from '@/Components/Home';
import MyFiles from '@/Components/MyFiles';
import Photos from '@/Components/Photos';
import Videos from '@/Components/Videos';

interface User {
  name: string;
  email: string;
  id: string;
  userId: string;
}

const Page = () => {

  // State to track which component to show
  const [activeComponent, setActiveComponent] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);


  // Function to handle user login status
const checkLoginStatus = async () => {
  try {
    const response = await fetch('/api/isLogin');
    const data = await response.json();
    if (data.isLoggedIn) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error("Login check failed:", error);
    setUser(null);
  } finally {
    setLoading(false);
  }
};



if (loading) {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <p className="text-lg text-gray-600 animate-pulse">Checking login status...</p>
    </div>
  );
}

if (!user) {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <h1 className="text-xl text-red-500 font-semibold">Please log in to access this page.</h1>
    </div>
  );
}


  // Function to render the active component
  const renderActiveComponent = () => {
    switch(activeComponent) {
      case 'home':
        return <Home />;
      case 'myfiles':
        return <MyFiles />;
      case 'videos':
        return <Videos />;
      case 'photos':
        return <Photos />;
      default:
        return <Home />;
    }
  };

  return (
    <div className='container mx-auto mt-4 px-4'>
      <Navbar />

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-8 mt-4'>
        {/* Left Section (Sidebar) */}
        <div className='left-section flex flex-row lg:flex-col gap-2 lg:gap-4 w-full lg:w-1/4 p-4 bg-gray-50 rounded-lg shadow-sm overflow-x-auto lg:overflow-x-visible'>
          
          {/* Home */}
          <div 
            onClick={() => setActiveComponent('home')}
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-md min-w-fit transition-colors ${
              activeComponent === 'home' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'
            }`}
          >
            <Image src="https://img.icons8.com/3d-fluency/94/home-automation.png" alt="Home Icon" width={24} height={24} />
            <p className='text-base font-semibold hidden md:block lg:block'>Home</p>
          </div>

          {/* My Files */}
          <div 
            onClick={() => setActiveComponent('myfiles')}
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-md min-w-fit transition-colors ${
              activeComponent === 'myfiles' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'
            }`}
          >
            <Image src="https://img.icons8.com/3d-fluency/94/business-report.png" alt="My Files" width={24} height={24} />
            <p className='text-base font-semibold hidden md:block lg:block'>My Files</p>
          </div>

          {/* Videos */}
          <div 
            onClick={() => setActiveComponent('videos')}
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-md min-w-fit transition-colors ${
              activeComponent === 'videos' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'
            }`}
          >
            <Image src="https://img.icons8.com/3d-fluency/94/movies-folder-v.png" alt="Videos Icon" width={24} height={24} />
            <p className='text-base font-semibold hidden md:block lg:block'>Videos</p>
          </div>

          {/* Photos */}
          <div 
            onClick={() => setActiveComponent('photos')}
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-md min-w-fit transition-colors ${
              activeComponent === 'photos' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'
            }`}
          >
            <Image src="https://img.icons8.com/3d-fluency/94/edit-image.png" alt="Photos Icon" width={24} height={24} />
            <p className='text-base font-semibold hidden md:block lg:block'>Photos</p>
          </div>

          <hr className="my-4 hidden lg:block" />

          {/* Upgrade your plan */}
          <div className='flex items-center justify-center gap-2 cursor-pointer border border-blue-500 rounded-full px-4 py-2 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors min-w-fit'>
            <Image src="/pro.svg" alt="Upgrade Plan" width={20} height={20} />
            <p className='text-sm font-bold hidden md:block lg:block'>Upgrade Plan</p>
          </div>
        </div>

        {/* Right Section (Main Content) */}
        <div className='right-section w-full lg:w-3/4 p-4 lg:p-8 bg-white rounded-lg shadow-sm'>
          <h1 className='text-2xl lg:text-4xl font-bold mb-4 text-gray-800'>
            Welcome to Your Dashboard
          </h1>
          <p> name is : {user?.name}  , email is : {user?.email} , user.id is : {user?.userId}</p>

          {/* Dynamic content based on selected menu */}
          <div className="mt-6 lg:mt-8">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;