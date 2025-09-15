// src/app/app/journal/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import the router
import { useAuth } from '@/context/AuthContext';
import { auth, firestore } from '@/lib/firebase'; // Import auth
import { signOut } from 'firebase/auth'; // Import signOut
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

interface Entry {
  id: string;
  content: string;
  createdAt: Timestamp;
  otoReply?: string;
  title?: string;
}

export default function JournalPage() {
  const { user } = useAuth();
  const router = useRouter(); // Initialize the router
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAiReply, setCurrentAiReply] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const entriesRef = collection(firestore, 'users', user.uid, 'entries');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      getDocs(q).then((querySnapshot) => {
        const fetchedEntries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Entry[];
        setEntries(fetchedEntries);
      });
    }
  }, [user]);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryContent.trim() || !user) return;

    setIsLoading(true);
    setCurrentAiReply('');
    setError('');

    try {
      const aspirationsColRef = collection(firestore, 'users', user.uid, 'aspirations');
      const aspirationsSnapshot = await getDocs(aspirationsColRef);
      const userAspirations = aspirationsSnapshot.docs.map(doc => doc.data().text);
      const recentEntries = entries.slice(0, 3).map(e => e.content);

      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentEntry: newEntryContent, aspirations: userAspirations, history: recentEntries }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const { title, reply } = await response.json();
      setCurrentAiReply(reply);

      const entriesRef = collection(firestore, 'users', user.uid, 'entries');
      await addDoc(entriesRef, { 
        title: title,
        content: newEntryContent,
        otoReply: reply,
        createdAt: serverTimestamp(),
      });
      
      setNewEntryContent('');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setEntries(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Entry[]);

    } catch (err) {
      console.error("ERROR DURING SAVE:", err);
      setError('Oto is feeling a bit tired. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // The new logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/signin'); // Redirect to sign-in page after logout
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out.");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4 bg-gray-50 min-h-screen">
      <header className="text-center my-6">
        <h1 className="text-4xl font-bold text-gray-800">Oto&apos;s Riverbank</h1>
        <p className="text-gray-600">A calm place for your thoughts.</p>
        {/* The new Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 text-sm text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-100 border transition-colors"
        >
          Logout
        </button>
      </header>
      
      <form onSubmit={handleSaveEntry} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <textarea 
          value={newEntryContent} 
          onChange={(e) => setNewEntryContent(e.target.value)} 
          placeholder="Dear Diary..." 
          // The text color fix is here
          className="w-full h-40 p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400" 
          disabled={isLoading} 
        />
        <button 
          type="submit" 
          disabled={isLoading || !newEntryContent.trim()} 
          className="w-full mt-4 p-3 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
        >
          {isLoading ? 'Oto is thinking...' : 'Save and Chat with Oto'}
        </button>
      </form>
      
      {error && <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {currentAiReply && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-400">
          <h2 className="font-bold text-lg mb-2 text-gray-700">Oto&apos;s Letter:</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{currentAiReply}</p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-700 border-b pb-2">Your Diary History</h2>
        {entries.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <li key={entry.id} className="py-3">
                  <Link href={`/app/journal/${entry.id}`} className="block hover:bg-gray-50 p-2 rounded-md">
                    <p className="font-semibold text-gray-800">{entry.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.createdAt?.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">Your diary entries will appear here.</p>
        )}
      </section>
    </div>
  );
}