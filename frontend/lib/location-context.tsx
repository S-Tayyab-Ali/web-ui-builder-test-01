"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserLocation } from '@/lib/types';
import { storage } from '@/lib/storage';

interface LocationContextType {
  location: UserLocation | null;
  requestLocation: () => Promise<void>;
  setManualLocation: (location: UserLocation) => void;
  isLoading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load saved location
    const savedLocation = storage.getLocation();
    if (savedLocation) {
      setLocation(savedLocation);
    } else {
      // Automatically request location on mount
      requestLocation();
    }
  }, []);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      // Set default location (San Francisco)
      const defaultLocation: UserLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'San Francisco, CA',
      };
      setLocation(defaultLocation);
      storage.setLocation(defaultLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        storage.setLocation(newLocation);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Using default location.');
        // Set default location (San Francisco)
        const defaultLocation: UserLocation = {
          latitude: 37.7749,
          longitude: -122.4194,
          address: 'San Francisco, CA',
        };
        setLocation(defaultLocation);
        storage.setLocation(defaultLocation);
        setIsLoading(false);
      }
    );
  };

  const setManualLocation = (newLocation: UserLocation) => {
    setLocation(newLocation);
    storage.setLocation(newLocation);
    setError(null);
  };

  return (
    <LocationContext.Provider
      value={{ location, requestLocation, setManualLocation, isLoading, error }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
