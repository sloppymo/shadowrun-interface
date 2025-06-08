import { useEffect } from 'react';
import Head from 'next/head';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import ShadowrunConsole from '../components/ShadowrunConsole';

// Default theme for the console
const defaultTheme = {
  name: 'Shadowrun Barren',
  background: 'bg-gray-950',
  text: 'text-red-300',
  secondaryText: 'text-gray-400',
  accent: 'bg-red-900 text-red-100',
  prompt: 'text-green-500',
  input: 'bg-gray-900 border-red-900 border',
  inputText: 'text-red-200',
  secondaryBackground: 'bg-gray-900'
};

export default function ConsolePage() {
  return (
    <>
      <Head>
        <title>Shadowrun Interface | Console</title>
        <meta name="description" content="Shadowrun RPG terminal interface" />
      </Head>

      <SignedIn>
        <div className="min-h-screen bg-sr-dark flex flex-col">
          <ShadowrunConsole theme={defaultTheme} />
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
