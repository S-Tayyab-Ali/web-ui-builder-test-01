"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainNav from '@/components/main-nav';
import RestaurantCard from '@/components/restaurant-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLocation } from '@/lib/location-context';
import { mockRestaurants } from '@/lib/mockData';
import { Restaurant } from '@/lib/types';
import { calculateDistance } from '@/lib/distance';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

export default function RestaurantsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { location } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (location) {
      // Calculate distances for all restaurants
      const restaurantsWithDistance = mockRestaurants.map((restaurant) => ({
        ...restaurant,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          restaurant.latitude,
          restaurant.longitude
        ),
      }));
      // Sort by distance
      restaurantsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setRestaurants(restaurantsWithDistance);
    } else {
      setRestaurants(mockRestaurants);
    }
  }, [location]);

  // Get unique cuisines
  const cuisines = useMemo(() => {
    const uniqueCuisines = Array.from(new Set(mockRestaurants.map((r) => r.cuisine)));
    return uniqueCuisines.sort();
  }, []);

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCuisine = !selectedCuisine || restaurant.cuisine === selectedCuisine;

      return matchesSearch && matchesCuisine;
    });
  }, [restaurants, searchTerm, selectedCuisine]);

  const handleToggleFavorite = (restaurantId: string) => {
    if (!user) return;

    const isFavorite = storage.isFavorite(user.id, restaurantId);
    if (isFavorite) {
      storage.removeFavorite(user.id, restaurantId);
      toast.success('Removed from favorites');
    } else {
      storage.addFavorite(user.id, restaurantId);
      toast.success('Added to favorites');
    }
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
        {/* Location indicator */}
        {location && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </span>
          </div>
        )}

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search restaurants or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Cuisine filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCuisine === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCuisine(null)}
            >
              All Cuisines
            </Button>
            {cuisines.map((cuisine) => (
              <Button
                key={cuisine}
                variant={selectedCuisine === cuisine ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCuisine(cuisine)}
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Found {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Restaurant grid */}
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
            <p className="text-gray-500 text-lg">No restaurants found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}


