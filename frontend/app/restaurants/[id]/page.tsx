"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainNav from '@/components/main-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLocation } from '@/lib/location-context';
import { mockRestaurants } from '@/lib/mockData';
import { Restaurant } from '@/lib/types';
import { calculateDistance, formatDistance } from '@/lib/distance';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

export default function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { location } = useLocation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const id = params.id as string;
    const found = mockRestaurants.find((r) => r.id === id);
    if (found) {
      const restaurantWithDistance = { ...found };
      if (location) {
        restaurantWithDistance.distance = calculateDistance(
          location.latitude,
          location.longitude,
          found.latitude,
          found.longitude
        );
      }
      setRestaurant(restaurantWithDistance);
      setIsFavorite(storage.isFavorite(user.id, id));
    } else {
      router.push('/restaurants');
    }
  }, [params.id, user, location, router]);

  const handleToggleFavorite = () => {
    if (!user || !restaurant) return;

    if (isFavorite) {
      storage.removeFavorite(user.id, restaurant.id);
      setIsFavorite(false);
      toast.success('Removed from favorites');
    } else {
      storage.addFavorite(user.id, restaurant.id);
      setIsFavorite(true);
      toast.success('Added to favorites');
    }
  };

  const handleGetDirections = () => {
    if (!restaurant) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}`
    )}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    if (!restaurant) return;
    window.location.href = `tel:${restaurant.phone}`;
  };

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="overflow-hidden">
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Heart
                className={`h-6 w-6 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
          </div>

          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-3">
                  <Badge className="text-sm">{restaurant.cuisine}</Badge>
                  {restaurant.priceRange && (
                    <span className="text-gray-600">{restaurant.priceRange}</span>
                  )}
                  {restaurant.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-lg">★</span>
                      <span className="font-semibold">{restaurant.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700">
                    {restaurant.address}
                  </p>
                  <p className="text-gray-700">
                    {restaurant.city}, {restaurant.state} {restaurant.zipCode}
                  </p>
                  {restaurant.distance !== undefined && (
                    <p className="text-sm text-orange-600 font-medium mt-1">
                      {formatDistance(restaurant.distance)} away
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {restaurant.phone}
                </a>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <p className="text-gray-700">{restaurant.hours}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGetDirections}
                className="flex-1"
                size="lg"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Get Directions
              </Button>
              <Button
                onClick={handleCall}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Restaurant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

