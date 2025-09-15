// src/app/signup/page.tsx
'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function SignUp() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      router.push('/onboarding'); // Redirect to onboarding after sign up
    } catch (error) {
      console.error(error);
      alert('Failed to sign up. The email might already be in use.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Join Otterly!</h1>
        <p className="text-center text-gray-600 mb-6">Oto is excited to meet you!</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('email')} type="email" placeholder="Email" required className="w-full p-2 border rounded" />
          <input {...register('password')} type="password" placeholder="Password (min. 6 characters)" required className="w-full p-2 border rounded" />
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">Create Account</button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account? <Link href="/signin" className="text-blue-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}