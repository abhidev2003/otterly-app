// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <div className="text-center">
        {/* You can add an image of Oto here later! */}
        <h1 className="text-5xl font-extrabold text-gray-800">Welcome to Otterly</h1>
        <p className="mt-4 text-lg text-gray-600">Your friendly, AI-powered journaling companion.</p>
        <div className="mt-8 space-x-4">
          <Link href="/signup" className="px-6 py-3 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600">
            Get Started
          </Link>
          <Link href="/signin" className="px-6 py-3 font-semibold text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-100">
            Sign In
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-5 text-gray-500">
        Built with care for you.
      </footer>
    </main>
  );
}