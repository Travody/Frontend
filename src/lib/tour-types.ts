import { 
  Building2, 
  Mountain, 
  UtensilsCrossed, 
  Landmark, 
  Trees, 
  Church, 
  Palette, 
  Camera, 
  ShoppingBag, 
  Moon, 
  Waves, 
  MapPin,
  Route
} from 'lucide-react';

export interface TourType {
  name: string;
  icon: any;
  color: string;
}

export const tourTypes: TourType[] = [
  { name: 'Cultural', icon: Building2, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { name: 'Adventure', icon: Mountain, color: 'bg-red-100 text-red-700 border-red-300' },
  { name: 'Food & Culinary', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { name: 'Historical', icon: Landmark, color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { name: 'Nature & Wildlife', icon: Trees, color: 'bg-green-100 text-green-700 border-green-300' },
  { name: 'Religious', icon: Church, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { name: 'Art & Architecture', icon: Palette, color: 'bg-pink-100 text-pink-700 border-pink-300' },
  { name: 'Photography', icon: Camera, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { name: 'Shopping', icon: ShoppingBag, color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { name: 'Nightlife', icon: Moon, color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { name: 'Beach & Water Sports', icon: Waves, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { name: 'Mountain & Trekking', icon: Route, color: 'bg-stone-100 text-stone-700 border-stone-300' },
  { name: 'City Tour', icon: MapPin, color: 'bg-slate-100 text-slate-700 border-slate-300' }
];

