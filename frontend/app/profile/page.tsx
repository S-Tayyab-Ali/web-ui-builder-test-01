"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainNav from '@/components/main-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Mail, MapPin, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLocation } from '@/lib/location-context';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { location, requestLocation } = useLocation();
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    storage.clearAll();
    logout();
    toast.success('Account deleted successfully');
    router.push('/login');
  };

  const handleRefreshLocation = async () => {
    setIsRefreshingLocation(true);
    await requestLocation();
    setIsRefreshingLocation(false);
    toast.success('Location updated');
  };

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const favoriteCount = storage.getFavorites(user.id).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Profile & Settings</h1>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  Name
                </Label>
                <Input value={user.name} disabled />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Member Since</Label>
                <Input
                  value={new Date(user.createdDate).toLocaleDateString()}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Saved Favorites</Label>
                <Input value={`${favoriteCount} restaurant${favoriteCount !== 1 ? 's' : ''}`} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
              <CardDescription>Your current location for finding nearby restaurants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {location ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {location.address ||
                      `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                  </p>
                  <Button
                    onClick={handleRefreshLocation}
                    variant="outline"
                    disabled={isRefreshingLocation}
                  >
                    {isRefreshingLocation ? 'Updating...' : 'Update Location'}
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Location not set</p>
                  <Button
                    onClick={handleRefreshLocation}
                    variant="outline"
                    disabled={isRefreshingLocation}
                  >
                    {isRefreshingLocation ? 'Getting location...' : 'Get My Location'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your saved favorites.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
