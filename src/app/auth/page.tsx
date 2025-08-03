'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

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
        setMessage(response.ok ? result.message : result.error || 'Login failed');
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
        setMessage(response.ok ? result.message : result.error || 'Registration failed');
      }
      reset(); // Clear form after submit
    } catch (error) {
      console.error('Error:', error);
      setMessage('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h1>{loginPage ? 'Login Page' : 'Signup Page'}</h1>

      {message && (
        <p style={{ color: message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'red' : 'green' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {!loginPage && (
          <div style={{ marginBottom: 10 }}>
            <label>Name</label>
            <input type="text" {...register('name')} />
            {'name' in errors && errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input type="email" {...register('email')} />
          {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input type="password" {...register('password')} />
          {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} style={{ marginBottom: 10 }}>
          {isLoading ? (loginPage ? 'Logging in...' : 'Registering...') : 'Submit'}
        </button>
      </form>

      <button onClick={() => { setLoginPage(!loginPage); setMessage(''); reset(); }}>
        {loginPage ? 'Go to Signup' : 'Go to Login'}
      </button>
    </div>
  );
}
