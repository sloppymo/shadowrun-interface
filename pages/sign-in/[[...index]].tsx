import { SignIn } from "@clerk/nextjs";
import Head from "next/head";

export default function SignInPage() {
  return (
    <>
      <Head>
        <title>Shadowrun Interface | Sign In</title>
        <meta name="description" content="Sign in to access Shadowrun Interface" />
      </Head>
      
      <div className="min-h-screen bg-sr-dark flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-black bg-opacity-70 border border-sr-red border-opacity-40 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-sr-green mb-6 text-center">
            <span className="sr-prompt">&gt;</span> Sign In
          </h1>
          
          {/* Customize Clerk SignIn component appearance */}
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-transparent shadow-none",
                headerTitle: "text-sr-green text-xl",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton: "bg-gray-900 border border-sr-red hover:bg-sr-red hover:text-black transition-colors",
                socialButtonsBlockButtonText: "text-gray-200",
                formButtonPrimary: "bg-sr-dark border border-sr-green text-sr-green hover:bg-sr-green hover:text-black transition-colors",
                formFieldLabel: "text-gray-300",
                formFieldInput: "bg-gray-900 border-sr-red text-gray-200",
                footerActionText: "text-gray-400",
                footerActionLink: "text-sr-green hover:text-sr-red"
              }
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </>
  );
}
