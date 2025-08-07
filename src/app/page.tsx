import { isLogin } from '@/lib/isLogin';
import { redirect } from 'next/navigation';

const page = async () => {
  const user = await isLogin();
  
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/auth');
  }
}

export default page
