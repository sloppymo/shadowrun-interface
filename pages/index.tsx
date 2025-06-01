import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  return (
    <>
      <Head>
        <title>Shadowrun Interface | Home</title>
        <meta name="description" content="Shadowrun multiplayer RPG interface" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-sr-dark flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-black bg-opacity-70 border border-sr-red border-opacity-40 rounded-lg p-8 text-white">
          <h1 className="text-4xl font-bold text-sr-green mb-4">
            <span className="sr-prompt">&gt;</span> Shadowrun Interface
          </h1>
          
          <p className="mb-8 text-gray-300">
            A multiplayer interface for Shadowrun role-playing sessions with specialized command parsing,
            AI-assisted gameplay, and real-time collaboration features.
          </p>
          
          <div className="space-y-4">
            {isLoaded && isSignedIn ? (
              <>
                <p className="text-sr-green">
                  Welcome back, <span className="text-sr-red">{user?.firstName || 'runner'}</span>
                </p>
                <div className="space-x-4">
                  <Link href="/dashboard" 
                    className="inline-block bg-sr-dark border border-sr-green text-sr-green px-6 py-2 rounded hover:bg-sr-green hover:text-black transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/console" 
                    className="inline-block bg-sr-dark border border-sr-red text-sr-red px-6 py-2 rounded hover:bg-sr-red hover:text-black transition-colors">
                    Console
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-x-4">
                <Link href="/sign-in" 
                  className="inline-block bg-sr-dark border border-sr-green text-sr-green px-6 py-2 rounded hover:bg-sr-green hover:text-black transition-colors">
                  Sign In
                </Link>
                <Link href="/sign-up" 
                  className="inline-block bg-sr-dark border border-sr-red text-sr-red px-6 py-2 rounded hover:bg-sr-red hover:text-black transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
