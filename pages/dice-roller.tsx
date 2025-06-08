import Head from 'next/head';
import Link from 'next/link';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import DiceRoller from '../components/DiceRoller';

export default function DiceRollerPage() {
  return (
    <>
      <Head>
        <title>Shadowrun Interface | Dice Roller</title>
        <meta name="description" content="Advanced Shadowrun dice roller with edge mechanics" />
      </Head>

      <main className="min-h-screen bg-gray-950">
        <SignedIn>
          <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-green-500 font-mono">
                <span className="text-red-400">&gt;</span> DICE ROLLER
              </h1>
              <p className="text-gray-400 mt-2">
                Advanced Shadowrun dice mechanics with edge actions and visual results
              </p>
            </header>

            <DiceRoller />

            <footer className="mt-8 text-center">
              <Link 
                href="/enhanced-dashboard" 
                className="bg-green-700 text-green-100 px-4 py-2 rounded hover:bg-green-600"
              >
                ← Back to Dashboard
              </Link>
            </footer>
          </div>
        </SignedIn>
        
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </main>
    </>
  );
}