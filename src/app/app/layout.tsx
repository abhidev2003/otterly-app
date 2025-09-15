// src/app/app/layout.tsx
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin'); // Redirect to sign-in if not loading and no user
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>; // Or a fancy spinner
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>; // Render the protected content
}