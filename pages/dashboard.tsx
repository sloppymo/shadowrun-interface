import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function Dashboard() {
  const { user } = useUser();
  const [activeSessions, setActiveSessions] = useState(0);
  const [systemStatus, setSystemStatus] = useState('Online');

  return (
    <>
      <Head>
        <title>Shadowrun Interface | Dashboard</title>
        <meta name="description" content="Shadowrun RPG dashboard" />
      </Head>

      <main className="min-h-screen bg-sr-dark">
        <SignedIn>
          <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-sr-green">
                <span className="sr-prompt">&gt;</span> Operator Dashboard
              </h1>
              <p className="text-gray-400">
                Logged in as <span className="text-sr-red">{user?.fullName || user?.username || 'Unknown User'}</span>
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Panel */}
              <div className="bg-black bg-opacity-70 border border-sr-red border-opacity-40 rounded-lg p-6">
                <h2 className="text-xl font-bold text-sr-green mb-4">System Status</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Backend:</span>
                    <span className={systemStatus === 'Online' ? 'text-green-500' : 'text-red-500'}>
                      {systemStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Active Sessions:</span>
                    <span className="text-sr-green">{activeSessions}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-black bg-opacity-70 border border-sr-red border-opacity-40 rounded-lg p-6">
                <h2 className="text-xl font-bold text-sr-green mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/console"
                    className="bg-sr-dark border border-sr-green text-sr-green px-4 py-2 rounded text-center hover:bg-sr-green hover:text-black transition-colors">
                    Launch Console
                  </Link>
                  <Link href="/sessions"
                    className="bg-sr-dark border border-sr-red text-sr-red px-4 py-2 rounded text-center hover:bg-sr-red hover:text-black transition-colors">
                    Join Session
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-black bg-opacity-70 border border-sr-red border-opacity-40 rounded-lg p-6">
              <h2 className="text-xl font-bold text-sr-green mb-4">Recent Activity</h2>
              <p className="text-gray-400 italic">No recent activity to display.</p>
            </div>
          </div>
        </SignedIn>
        
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </main>
    </>
  );
}
