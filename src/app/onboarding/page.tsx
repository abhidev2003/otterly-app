// src/app/onboarding/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Define a type for our form data
type OnboardingData = {
  name: string;
  age: string; // HTML inputs give strings
  gender: string;
  aspiration1: string;
  aspiration2: string;
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<OnboardingData>();

  const onSubmit = async (data: OnboardingData) => {
    if (!user) return alert('You must be logged in.');

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        name: data.name,
        age: parseInt(data.age, 10), // Convert age string to a number
        gender: data.gender,
        onboardingDone: true,
        createdAt: serverTimestamp(),
      });

      const aspirationsColRef = collection(firestore, 'users', user.uid, 'aspirations');
      await addDoc(aspirationsColRef, { text: data.aspiration1, createdAt: serverTimestamp() });
      await addDoc(aspirationsColRef, { text: data.aspiration2, createdAt: serverTimestamp() });

      router.push('/app/journal');
    } catch (error) {
      console.error("Error during onboarding:", error);
      alert('Failed to save your information. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">A Little About You</h1>
        <div className="p-4 mb-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
          <p className="font-bold">Oto&apos;s Tip! 🦦</p> {/* Replaced ' with &apos; */}
          <p>Sharing your aspirations helps me understand what matters to you. I&apos;ll use them to offer encouragement that&apos;s tailored to your dreams!</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input {...register('name')} type="text" required className="w-full p-2 border rounded mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input {...register('age')} type="number" required className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <input {...register('gender')} type="text" placeholder="e.g., Man, Woman, Non-binary" required className="w-full p-2 border rounded mt-1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">What is one thing you hope to achieve?</label>
            <input {...register('aspiration1')} type="text" required className="w-full p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">What is another goal or dream you have?</label>
            <input {...register('aspiration2')} type="text" required className="w-full p-2 border rounded mt-1" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full p-3 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400">
            {isSubmitting ? 'Saving...' : "Let's Go!"}
          </button>
        </form>
      </div>
    </div>
  );
}