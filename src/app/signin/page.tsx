// src/app/signin/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';

type FormData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>();
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 overflow-hidden">
      {/* This new container acts as an anchor for the absolute positioning */}
      <div className="relative">
        {/* Oto is positioned absolutely, halfway above the top of the container */}
        <Image
          src="/oto-standing-transparent.png"
          alt="Oto the otter mascot peeking over the form"
          width={150}
          height={150}
          className="absolute -top-[75px] left-1/2 -translate-x-1/2 z-0"
        />

        {/* The form has a higher z-index and top padding to make space for Oto */}
        <div className="relative p-8 pt-20 bg-white rounded-lg shadow-md w-96 z-10">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-center text-gray-600 mb-6">Let&apos;s continue our journey.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input 
              {...register('email')} 
              type="email" 
              placeholder="Email" 
              required 
              className="w-full p-2 border rounded text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400" 
            />
            <input 
              {...register('password')} 
              type="password" 
              placeholder="Password" 
              required 
              className="w-full p-2 border rounded text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400" 
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-sm text-center">
            Need an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}