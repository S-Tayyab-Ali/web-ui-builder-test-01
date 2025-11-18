"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainNav from '@/components/main-nav';
import RestaurantCard from '@/components/restaurant-card';
import { Input } from '@/components/ui/input';
import { Search, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLocation } from '@/lib/location-context';
import { mockRestaurants } from '@/lib/mockData';
import { Restaurant } from '@/lib/types';
import { calculateDistance } from '@/lib/distance';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { location } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const favorites = storage.getFavorites(user.id);
    const favoriteIds = favorites.map((f) => f.restaurantId);
    
    let restaurants = mockRestaurants.filter((r) => favoriteIds.includes(r.id));

    if (location) {
      restaurants = restaurants.map((restaurant) => ({
        ...restaurant,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          restaurant.latitude,
          restaurant.longitude
        ),
      }));
    }

    setFavoriteRestaurants(restaurants);
  }, [user, location, refreshKey]);

  const filteredRestaurants = useMemo(() => {
    return favoriteRestaurants.filter((restaurant) => {
      return (
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [favoriteRestaurants, searchTerm]);

  const handleToggleFavorite = (restaurantId: string) => {
    if (!user) return;

    storage.removeFavorite(user.id, restaurantId);
    toast.success('Removed from favorites');
    setRefreshKey((prev) => prev + 1);
  };

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            My Favorites
          </h1>
          <p className="text-gray-600">
            Your saved restaurants for quick access
          </p>
        </div>

        {favoriteRestaurants.length > 0 ? (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search your favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {filteredRestaurants.length} favorite{filteredRestaurants.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={`${restaurant.id}-${refreshKey}`}
                  onClick={() => router.push(`/restaurants/${restaurant.id}`)}
                >
                  <RestaurantCard
                    restaurant={restaurant}
                    onToggleFavorite={() => handleToggleFavorite(restaurant.id)}
                  />
                </div>
              ))}
            </div>

            {filteredRestaurants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No favorites found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start exploring restaurants and save your favorites for quick access
            </p>
            <button
              onClick={() => router.push('/restaurants')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Discover Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
