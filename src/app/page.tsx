import React from 'react'
import { isLogin } from '@/lib/isLogin';
import { logout } from '@/lib/logout';

const page = async () => {
  const user = await isLogin();
  if (!user) {
    return (
      <div>
        <h1>Please log in to access this page.</h1>
        
      </div>
    );
  }
  return (
    <div>
      <h1>homepage</h1>
      <form action={logout}>
        <button type="submit">Logout</button>
      </form>
    </div>
  )
}

export default page
