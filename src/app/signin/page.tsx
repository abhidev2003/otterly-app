// src/app/signin/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

type FormData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/app/journal');
    } catch (error) {
      console.error(error);
      alert('Failed to sign in. Please check your email and password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome Back!</h1>
        <p className="text-center text-gray-600 mb-6">Let&apos;s continue our journey.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fix is here 👇 */}
          <input {...register('email')} type="email" placeholder="Email" required className="w-full p-2 border rounded text-gray-800" />
          {/* Fix is here 👇 */}
          <input {...register('password')} type="password" placeholder="Password" required className="w-full p-2 border rounded text-gray-800" />
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">Sign In</button>
        </form>
        <p className="mt-4 text-sm text-center">
          Need an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}