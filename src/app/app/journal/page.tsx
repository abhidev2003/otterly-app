// src/app/app/journal/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, updateDoc, Timestamp, limit, where } from 'firebase/firestore';

// Define types for our data structures
interface Journal {
  id: string;
  title: string;
  createdAt: Timestamp;
  status: 'active' | 'archived';
}
interface JournalEntry {
  id: string;
  content: string;
  createdAt: Timestamp;
  otoReply?: string;
  title?: string;
  journalId: string;
}

export default function JournalPage() {
  const { user } = useAuth();
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);
  const [journalLoading, setJournalLoading] = useState(true);
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const [error, setError] = useState('');

  // A single, combined useEffect to fetch all necessary data
  useEffect(() => {
    if (!user) {
      setJournalLoading(false);
      return;
    }
    const fetchAllData = async () => {
      setJournalLoading(true);
      const journalsRef = collection(firestore, 'journals', user.uid, 'userJournals');
      const qJournal = query(journalsRef, where('status', '==', 'active'), limit(1));
      const journalSnapshot = await getDocs(qJournal);
      
      if (!journalSnapshot.empty) {
        const journalDoc = journalSnapshot.docs[0];
        const currentJournal = { id: journalDoc.id, ...journalDoc.data() } as Journal;
        setActiveJournal(currentJournal);

        const entriesRef = collection(firestore, 'journals', user.uid, 'userJournals', currentJournal.id, 'entries');
        const qEntries = query(entriesRef, orderBy('createdAt', 'desc'));
        const entriesSnapshot = await getDocs(qEntries);
        const entries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JournalEntry[];
        setPastEntries(entries);
      } else {
        setActiveJournal(null);
        setPastEntries([]);
      }
      setJournalLoading(false);
    };
    fetchAllData();
  }, [user]);

  const handleStartNewJournal = async () => {
    if (!user) return;
    const title = prompt("What would you like to name this new journal volume?");
    if (title) {
      const journalsRef = collection(firestore, 'journals', user.uid, 'userJournals');
      const newDocRef = await addDoc(journalsRef, {
        title: title,
        createdAt: serverTimestamp(),
        status: 'active',
      });
      setActiveJournal({ id: newDocRef.id, title, createdAt: Timestamp.now(), status: 'active' });
    }
  };

  const handleConcludeJournal = async () => {
    if (!user || !activeJournal) return;
    const isConfirmed = window.confirm(
      `Are you sure you want to conclude the journal "${activeJournal.title}"? You won't be able to add new entries to it.`
    );
    if (isConfirmed) {
      const journalDocRef = doc(firestore, 'journals', user.uid, 'userJournals', activeJournal.id);
      await updateDoc(journalDocRef, {
        status: 'archived',
        endedAt: serverTimestamp(),
      });
      setActiveJournal(null);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim() || !user || !activeJournal) return;
    setIsLoading(true);
    setAiReply('');
    setError('');
    let newEntryId = '';
    let finalAiReply = '';
    try {
      const entriesRef = collection(firestore, 'journals', user.uid, 'userJournals', activeJournal.id, 'entries');
      const newDocRef = await addDoc(entriesRef, { content: entry, createdAt: serverTimestamp() });
      newEntryId = newDocRef.id;
      const aspirationsColRef = collection(firestore, 'users', user.uid, 'aspirations');
      const aspirationsSnapshot = await getDocs(aspirationsColRef);
      const userAspirations = aspirationsSnapshot.docs.map(doc => doc.data().text);
      const recentEntries = pastEntries.slice(0, 3).map(e => e.content);
      const response = await fetch('/api/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentEntry: entry, aspirations: userAspirations, history: recentEntries }) });
      if (!response.body) throw new Error("Response body is null.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const rawText = decoder.decode(value, { stream: true });
        const lines = rawText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data.trim() === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const textChunk = parsed.response;
              setAiReply((prev) => prev + textChunk);
              finalAiReply += textChunk;
            } catch (e) { console.error('Failed to parse SSE chunk:', e); }
          }
        }
      }
      if (newEntryId && finalAiReply) {
        const entryDocRef = doc(entriesRef, newEntryId);
        await updateDoc(entryDocRef, { otoReply: finalAiReply });
      }
      setEntry('');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setPastEntries(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JournalEntry[]);
    } catch (err) {
      console.error(err);
      setError('Oto is sleeping... Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (journalLoading) {
    return <div className="text-center p-10">Checking your diary...</div>;
  }

  if (!activeJournal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Your Riverbank</h1>
        <p className="text-gray-600 mt-2 mb-8">It looks like you're ready for a new chapter.</p>
        <button onClick={handleStartNewJournal} className="px-8 py-4 text-lg font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600">
          Begin a New Journal
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 bg-gray-50 min-h-screen">
      <header className="text-center my-6">
        <h1 className="text-4xl font-bold text-gray-800">{activeJournal.title}</h1>
        <p className="text-gray-600">A calm place for your thoughts.</p>
        <button
          onClick={handleConcludeJournal}
          className="mt-4 px-4 py-2 text-sm text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600"
        >
          Conclude This Journal
        </button>
      </header>
      
      <form onSubmit={handleSaveEntry} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="What's on your mind today?" className="w-full h-40 p-3 border rounded-md focus:ring-2 focus:ring-blue-400" disabled={isLoading} />
        <button type="submit" disabled={isLoading || !entry.trim()} className="w-full mt-4 p-3 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 font-semibold">
          {isLoading ? 'Saving & Thinking...' : 'Save and Chat with Oto'}
        </button>
      </form>

      {aiReply && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-400">
          <h2 className="font-bold text-lg mb-2 text-gray-700">Oto says:</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{aiReply}</p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-700 border-b pb-2">Recent Entries in this Journal</h2>
        {pastEntries.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
              {pastEntries.map((pastEntry) => (
                <li key={pastEntry.id} className="py-3">
                  <Link href={`/app/journal/${pastEntry.id}`} className="block hover:bg-gray-50 p-2 rounded-md">
                    <p className="font-semibold text-gray-800">{pastEntry.title || 'Untitled Entry'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(pastEntry.createdAt?.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">Your first entry in this journal will appear here.</p>
        )}
      </section>
    </div>
  );
}