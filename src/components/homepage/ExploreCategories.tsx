import { Mountain, Building, Umbrella, Castle, Leaf, Zap } from 'lucide-react';

const categories = [
  {
    id: 1,
    name: "Adventure",
    icon: Mountain,
    description: "Trekking, rafting, mountaineering",
    tourCount: "250+ Tours",
    color: "text-orange-500"
  },
  {
    id: 2,
    name: "Cultural",
    icon: Building,
    description: "Heritage sites, temples, traditions",
    tourCount: "180+ Tours",
    color: "text-purple-500"
  },
  {
    id: 3,
    name: "Beach",
    icon: Umbrella,
    description: "Coastal tours, water sports",
    tourCount: "95+ Tours",
    color: "text-blue-500"
  },
  {
    id: 4,
    name: "Historical",
    icon: Castle,
    description: "Forts, palaces, monuments",
    tourCount: "320+ Tours",
    color: "text-amber-500"
  },
  {
    id: 5,
    name: "Wildlife",
    icon: Leaf,
    description: "National parks, safaris",
    tourCount: "70+ Tours",
    color: "text-green-500"
  },
  {
    id: 6,
    name: "Spiritual",
    icon: Zap,
    description: "Pilgrimages, meditation",
    tourCount: "140+ Tours",
    color: "text-indigo-500"
  }
];

export default function ExploreCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 mx-auto mb-4 ${category.color} group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-full h-full" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {category.description}
                </p>
                <p className="text-sm font-medium text-primary-600">
                  {category.tourCount}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

