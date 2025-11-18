"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/restaurants');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🍴</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Food Finder</h1>
        <p className="text-gray-600">Loading your food discovery experience...</p>
      </div>
    </div>
  );
}
