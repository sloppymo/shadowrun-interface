import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: "Enhanced Console",
      description: "Advanced terminal with command history, auto-completion, and real-time collaboration",
      icon: "🖥️",
      link: "/enhanced-console"
    },
    {
      title: "Character Management",
      description: "Complete Shadowrun character sheets with attributes, skills, and condition tracking",
      icon: "🎭",
      link: "/enhanced-dashboard"
    },
    {
      title: "Dice System",
      description: "Full Shadowrun dice mechanics with edge actions, glitches, and visual results",
      icon: "🎲",
      link: "/dice-roller"
    },
    {
      title: "Session Management",
      description: "Create and join multiplayer sessions with real-time synchronization",
      icon: "🎮",
      link: "/enhanced-dashboard"
    }
  ];

  // Rotate features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);
  
  return (
    <>
      <Head>
        <title>Shadowrun Interface v2.0 | Enhanced RPG Platform</title>
        <meta name="description" content="Advanced Shadowrun multiplayer RPG interface with real-time collaboration, enhanced dice mechanics, and comprehensive character management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-green-500 mb-4 font-mono">
              <span className="text-red-400">&gt;</span> SHADOWRUN INTERFACE
            </h1>
            <div className="text-xl text-green-400 mb-2 font-mono">v2.0 ENHANCED</div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The ultimate platform for Shadowrun role-playing sessions featuring advanced dice mechanics,
              real-time collaboration, comprehensive character management, and AI-assisted gameplay.
            </p>
          </div>

          {/* Feature Showcase */}
          <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-8 mb-8">
            <div className="text-center">
              <div className="text-6xl mb-4">{features[currentFeature].icon}</div>
              <h2 className="text-2xl font-bold text-green-500 mb-2">{features[currentFeature].title}</h2>
              <p className="text-gray-300 mb-4">{features[currentFeature].description}</p>
              <div className="flex justify-center space-x-2 mb-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentFeature ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {isLoaded && isSignedIn ? (
              <>
                {/* Authenticated User Actions */}
                <div className="bg-black bg-opacity-70 border border-green-900 border-opacity-40 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-500 mb-4">
                    Welcome back, <span className="text-red-400">{user?.firstName || 'runner'}</span>
                  </h3>
                  <div className="space-y-3">
                    <Link href="/enhanced-dashboard"
                      className="block w-full bg-green-700 border border-green-500 text-green-100 px-6 py-3 rounded hover:bg-green-600 transition-colors text-center">
                      🚀 Enhanced Dashboard
                    </Link>
                    <Link href="/enhanced-console"
                      className="block w-full bg-blue-700 border border-blue-500 text-blue-100 px-6 py-3 rounded hover:bg-blue-600 transition-colors text-center">
                      🖥️ Launch Enhanced Console
                    </Link>
                    <Link href="/dice-roller"
                      className="block w-full bg-purple-700 border border-purple-500 text-purple-100 px-6 py-3 rounded hover:bg-purple-600 transition-colors text-center">
                      🎲 Advanced Dice Roller
                    </Link>
                  </div>
                </div>

                <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-red-400 mb-4">Legacy Access</h3>
                  <div className="space-y-3">
                    <Link href="/dashboard"
                      className="block w-full bg-gray-700 border border-gray-500 text-gray-100 px-6 py-3 rounded hover:bg-gray-600 transition-colors text-center">
                      📊 Legacy Dashboard
                    </Link>
                    <Link href="/console"
                      className="block w-full bg-gray-700 border border-gray-500 text-gray-100 px-6 py-3 rounded hover:bg-gray-600 transition-colors text-center">
                      💻 Legacy Console
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Guest Actions */}
                <div className="bg-black bg-opacity-70 border border-green-900 border-opacity-40 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-500 mb-4">Get Started</h3>
                  <p className="text-gray-300 mb-4">
                    Sign up to access the full Shadowrun Interface experience with character sheets,
                    session management, and real-time collaboration.
                  </p>
                  <Link href="/sign-up"
                    className="block w-full bg-green-700 border border-green-500 text-green-100 px-6 py-3 rounded hover:bg-green-600 transition-colors text-center">
                    🎮 Create Account
                  </Link>
                </div>

                <div className="bg-black bg-opacity-70 border border-blue-900 border-opacity-40 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">Returning Runner?</h3>
                  <p className="text-gray-300 mb-4">
                    Welcome back, choom. Sign in to access your characters, sessions, and preferences.
                  </p>
                  <Link href="/sign-in"
                    className="block w-full bg-blue-700 border border-blue-500 text-blue-100 px-6 py-3 rounded hover:bg-blue-600 transition-colors text-center">
                    🔑 Sign In
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: "⚡", title: "Real-time Sync", desc: "Live collaboration with WebSocket technology" },
              { icon: "🎯", title: "Advanced Dice", desc: "Full SR5/6 mechanics with edge and glitches" },
              { icon: "📋", title: "Character Sheets", desc: "Complete character management system" },
              { icon: "🤖", title: "AI Assistance", desc: "Smart command suggestions and help" },
              { icon: "🎨", title: "Custom Themes", desc: "Multiple cyberpunk visual themes" },
              { icon: "🔒", title: "Secure Sessions", desc: "Encrypted multiplayer sessions" },
              { icon: "📱", title: "Responsive", desc: "Works on desktop, tablet, and mobile" },
              { icon: "⌨️", title: "Terminal Feel", desc: "Authentic command-line experience" }
            ].map((feature, index) => (
              <div key={index} className="bg-black bg-opacity-50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-bold text-green-400 mb-1">{feature.title}</h4>
                <p className="text-xs text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 text-sm">
            <p>Shadowrun Interface v2.0 • Enhanced for the 6th World</p>
            <p className="mt-2">Built for runners, by runners • Open source and community driven</p>
          </div>
        </div>
      </main>
    </>
  );
}
