import { useEffect } from 'react';
import Head from 'next/head';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import EnhancedShadowrunConsole from '../components/EnhancedShadowrunConsole';

export default function EnhancedConsolePage() {
  return (
    <>
      <Head>
        <title>Shadowrun Interface | Enhanced Console</title>
        <meta name="description" content="Enhanced Shadowrun RPG terminal interface with real-time collaboration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <SignedIn>
        <div className="min-h-screen bg-gray-950 flex flex-col">
          <EnhancedShadowrunConsole />
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}