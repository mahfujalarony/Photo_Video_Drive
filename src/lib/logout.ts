import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  'use server';
  
  (await cookies()).delete('token');
  redirect('/auth'); 
}