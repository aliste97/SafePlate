'use client';

import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebaseConfig'; // Adjust path if needed
import { useRouter } from 'next/navigation';

const auth = getAuth(app);

import SafePlateApp from '@/components/SafePlateApp';
export default function HomePage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  // Handle loading state first
  if (loading) {
    return <p>Loading...</p>;
  }

  // If not loading and no user, redirect to auth
  if (!user) {
    router.push('/auth');
    return null; // Return null while redirecting
  }

  // If authenticated, render the app
  return <SafePlateApp />;
}