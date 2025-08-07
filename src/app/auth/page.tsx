'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Schema define
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Type
type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export default function Page() {
  const [message, setMessage] = useState('');
  const [loginPage, setLoginPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignupFormData | LoginFormData>({
    resolver: zodResolver(loginPage ? loginSchema : signupSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setMessage('');
    try {
      if (loginPage) {
        // Login logic
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
          credentials: 'include',
        });

        const result = await response.json();
        if (response.ok) {
          setMessage(result.message);
          router.push('/dashboard');
        } else {
          setMessage(result.error || 'Login failed');
        }
      } else {
        // Signup logic
        const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
          credentials: 'include',
        });

        const result = await response.json();
        if (response.ok) {
          setMessage(result.message);
          router.push('/dashboard');
        }
        else {
          setMessage(result.error || 'Registration failed');
        }
      }
      reset(); 
    } catch (error) {
      console.error('Error:', error);
      setMessage('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {loginPage ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-blue-100 mt-2 text-sm md:text-base">
              {loginPage ? 'Sign in to your account' : 'Join us today'}
            </p>
          </div>

          {/* Form Container */}
          <div className="px-6 py-8">
            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg text-sm md:text-base ${
                message.toLowerCase().includes('fail') || message.toLowerCase().includes('error')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field (only for signup) */}
              {!loginPage && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm md:text-base"
                    placeholder="Enter your full name"
                  />
                  {'name' in errors && errors.name && (
                    <p className="text-red-500 text-xs md:text-sm">{errors.name.message}</p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm md:text-base"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs md:text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm md:text-base"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs md:text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isLoading 
                  ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{loginPage ? 'Logging in...' : 'Creating Account...'}</span>
                    </div>
                  ) 
                  : (loginPage ? 'Sign In' : 'Create Account')
                }
              </button>
            </form>

            {/* Toggle Button */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm md:text-base mb-4">
                {loginPage ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                onClick={() => { 
                  setLoginPage(!loginPage); 
                  setMessage(''); 
                  reset(); 
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm md:text-base underline-offset-4 hover:underline transition duration-200"
              >
                {loginPage ? 'Create New Account' : 'Sign In Instead'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}