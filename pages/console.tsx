import { useEffect } from 'react';
import Head from 'next/head';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import ShadowrunConsole from '../components/ShadowrunConsole';

export default function ConsolePage() {
  return (
    <>
      <Head>
        <title>Shadowrun Interface | Console</title>
        <meta name="description" content="Shadowrun RPG terminal interface" />
      </Head>

      <SignedIn>
        <div className="min-h-screen bg-sr-dark flex flex-col">
          <ShadowrunConsole />
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
