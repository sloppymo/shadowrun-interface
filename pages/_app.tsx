import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { useRouter } from 'next/router';

function ShadowrunInterface({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Skip Clerk for test pages only (keep test functionality available)
  if (router.pathname === '/test') {
    return <Component {...pageProps} />;
  }

  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default ShadowrunInterface;
