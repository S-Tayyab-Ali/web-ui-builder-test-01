export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  rating?: number;
  priceRange?: string;
  imageUrl?: string;
  distance?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdDate: string;
}

export interface Favorite {
  id: string;
  userId: string;
  restaurantId: string;
  createdDate: string;
  notes?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}
