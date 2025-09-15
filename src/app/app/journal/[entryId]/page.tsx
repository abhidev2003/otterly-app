// src/app/app/journal/[entryId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

interface Entry {
  content: string;
  createdAt: Timestamp;
  otoReply?: string;
  title?: string;
}

export default function EntryDetailPage({ params }: { params: { entryId: string } }) {
  const { user } = useAuth();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { entryId } = params;

  useEffect(() => {
    if (user && entryId) {
      const fetchEntry = async () => {
        setIsLoading(true);
        const docRef = doc(firestore, 'users', user.uid, 'entries', entryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEntry(docSnap.data() as Entry);
        } else {
          console.log("No such document!");
        }
        setIsLoading(false);
      };
      fetchEntry();
    }
  }, [user, entryId]);

  if (isLoading) {
    return <div className="text-center p-10">Loading your memory...</div>;
  }

  if (!entry) {
    return <div className="text-center p-10">Could not find this entry.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Link href="/app/journal" className="text-blue-500 hover:underline mb-6 inline-block">&larr; Back to Diary</Link>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{entry.title || 'Untitled Entry'}</h1>
        <p className="text-sm text-gray-500 mb-4">
          {new Date(entry.createdAt?.toDate()).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </p>
        <p className="text-gray-800 mb-6 whitespace-pre-wrap">{entry.content}</p>
        {entry.otoReply && (
          <div className="border-t pt-6 mt-6">
            <h2 className="font-bold text-lg text-gray-700 mb-2">Oto&apos;s Letter:</h2>
            <p className="text-gray-600 italic whitespace-pre-wrap">{entry.otoReply}</p>
          </div>
        )}
      </div>
    </div>
  );
}