'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export function AuthButton() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  const handleSignIn = () => {
    window.location.href = '/api/auth/yahoo';
  };

  const handleSignOut = async () => {
    try {
      // Clear auth cookies
      await fetch('/api/auth/logout', { method: 'POST' });
      await checkAuth();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (isAuthenticated) {
    return (
      <Button onClick={handleSignOut} variant="outline">
        Sign Out
      </Button>
    );
  }

  return (
    <Button onClick={handleSignIn}>
      Sign in with Yahoo
    </Button>
  );
}

