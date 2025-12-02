import { Mountain, Building, Umbrella, Castle, Leaf, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Heading } from '@/components/ui/heading';

const categories = [
  {
    id: 1,
    name: "Adventure",
    icon: Mountain,
    description: "Trekking, rafting, mountaineering",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    id: 2,
    name: "Cultural",
    icon: Building,
    description: "Heritage sites, temples, traditions",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    id: 3,
    name: "Beach",
    icon: Umbrella,
    description: "Coastal tours, water sports",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: 4,
    name: "Historical",
    icon: Castle,
    description: "Forts, palaces, monuments",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    id: 5,
    name: "Wildlife",
    icon: Leaf,
    description: "National parks, safaris",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    id: 6,
    name: "Spiritual",
    icon: Zap,
    description: "Pilgrimages, meditation",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  }
];

export default function ExploreCategories() {
  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <Heading as="h2" variant="section" className="mb-4 text-3xl md:text-4xl">
            Explore by Category
          </Heading>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect experience that matches your interests
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className="border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 ${category.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-7 h-7 ${category.color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
