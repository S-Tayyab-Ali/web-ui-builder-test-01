"use client";

import React from 'react';
import { Restaurant } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { formatDistance } from '@/lib/distance';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onToggleFavorite: () => void;
}

export default function RestaurantCard({ restaurant, onToggleFavorite }: RestaurantCardProps) {
  const { user } = useAuth();
  const isFavorite = user ? storage.isFavorite(user.id, restaurant.id) : false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    onToggleFavorite();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-0">
        <div className="relative h-48 overflow-hidden">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
            {restaurant.rating && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{restaurant.rating}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              {restaurant.cuisine}
            </Badge>
            {restaurant.priceRange && (
              <span className="ml-2 text-sm text-gray-600">{restaurant.priceRange}</span>
            )}
          </div>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {restaurant.address}, {restaurant.city}
              </span>
            </div>
            {restaurant.distance !== undefined && (
              <div className="flex items-center gap-2">
                <span className="ml-6 text-xs font-medium text-orange-600">
                  {formatDistance(restaurant.distance)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{restaurant.phone}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
