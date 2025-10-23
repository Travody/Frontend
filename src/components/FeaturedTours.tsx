import { Star, MapPin, Clock, User } from 'lucide-react';
import Link from 'next/link';

const tours = [
  {
    id: 1,
    title: "Taj Mahal Sunrise & Agra Fort Explorer",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Popular",
    badgeColor: "bg-red-500",
    rating: 4.9,
    reviews: 234,
    duration: "3 Days",
    description: "Experience the magic of Taj Mahal at sunrise with a certified guide. Includes Agra Fort and local cuisine.",
    guide: {
      name: "Rajesh Kumar",
      title: "Verified Pro Guide",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    price: 5999,
    originalPrice: 7999
  },
  {
    id: 2,
    title: "Alleppey Houseboat & Village Experience",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Eco-Tour",
    badgeColor: "bg-green-500",
    rating: 4.8,
    reviews: 189,
    duration: "2 Days",
    description: "Cruise through serene backwaters on traditional houseboat. Authentic Kerala cuisine and village interactions.",
    guide: {
      name: "Priya Nair",
      title: "Local Expert",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    price: 8499,
    originalPrice: 10999
  },
  {
    id: 3,
    title: "North Goa Beaches & Nightlife Tour",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Beach",
    badgeColor: "bg-blue-500",
    rating: 4.7,
    reviews: 156,
    duration: "4 Days",
    description: "Explore pristine beaches, beach shacks, water sports, and vibrant nightlife of North Goa with local insights.",
    guide: {
      name: "Marcus D'Souza",
      title: "Local Expert",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    price: 12999,
    originalPrice: 15999
  }
];

export default function FeaturedTours() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Tours & Experiences
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium ${tour.badgeColor}`}>
                  {tour.badge}
                </div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg px-2 py-1 flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">{tour.rating}</span>
                  <span className="ml-1 text-sm text-gray-500">({tour.reviews})</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{tour.title}</h3>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{tour.duration}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {tour.description}
                </p>

                <div className="flex items-center mb-4">
                  <img
                    src={tour.guide.avatar}
                    alt={tour.guide.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tour.guide.name}</p>
                    <p className="text-xs text-gray-500">{tour.guide.title}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">₹{tour.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-500 line-through ml-2">₹{tour.originalPrice.toLocaleString()}</span>
                  </div>
                  <span className="text-sm text-gray-500">per person</span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/tours/${tour.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/tours/${tour.id}/book`}
                    className="flex-1 bg-secondary-500 text-white py-2 px-4 rounded-lg hover:bg-secondary-600 transition-colors text-center font-medium"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

