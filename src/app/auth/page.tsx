'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { app } from '@/lib/firebaseConfig'; // Firebase config
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuthentication = async () => {
    try {
      setError(null); // Clear previous errors
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/'); // Redirect to home page on success
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null); // Clear previous errors
      const result = await signInWithPopup(auth, googleProvider);
      // Signed in successfully with Google
      console.log('Google Sign-In successful:', result.user);
      router.push('/'); // Redirect to home page on success
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        // If popup is blocked, try redirect flow
        signInWithRedirect(auth, googleProvider);
      } else {
        setError(err.message);
      }
    }
  };

  // Effect to handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in via redirect
          console.log('Google Sign-In (Redirect) successful:', result.user);
          router.push('/'); // Redirect to home page on success
        }
      } catch (error: any) {
        setError(error.message);
      }
    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLoginMode ? 'Sign In' : 'Sign Up'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button className="w-full" onClick={handleAuthentication}>
              {isLoginMode ? 'Sign In' : 'Sign Up'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              Switch to {isLoginMode ? 'Sign Up' : 'Sign In'}
            </Button>
            <Button
              variant="outline"
                          className="w-full"
            onClick={handleGoogleSignIn}>
                          Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;