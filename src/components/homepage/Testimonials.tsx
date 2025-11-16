import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';

const stats = [
  { value: "4.9", label: "Overall Rating", color: "text-orange-500" },
  { value: "50K+", label: "Happy Travelers", color: "text-gray-900" },
  { value: "2.5K+", label: "Verified Reviews", color: "text-green-500" },
  { value: "98%", label: "Recommend Rate", color: "text-purple-500" }
];

const testimonials = [
  {
    id: 1,
    rating: 5,
    date: "2 days ago",
    review: "Absolutely amazing experience! Rajesh made our Taj Mahal visit unforgettable. His knowledge and passion for the history was incredible.",
    author: "Sarah Johnson",
    location: "From USA • Solo Traveler",
    tags: ["Cultural Tour", "Verified Booking"]
  },
  {
    id: 2,
    rating: 5,
    date: "5 days ago",
    review: "The Kerala houseboat experience with Priya was magical. She showed us the authentic side of Kerala that we would never have discovered on our own.",
    author: "David & Emma Wilson",
    location: "From UK • Couple",
    tags: ["Nature Tour", "Local Expert"]
  },
  {
    id: 3,
    rating: 5,
    date: "1 week ago",
    review: "Marcus made our Goa trip absolutely perfect! From the best beaches to the hidden gems, he knew all the right places. Highly recommended!",
    author: "Amit & Friends",
    location: "From Mumbai • Group of 6",
    tags: ["Beach Tour", "Adventure"]
  }
];

export default function Testimonials() {
  return (
    <Section variant="muted">
      <Container>
        <div className="text-center mb-12">
          <Heading as="h2" variant="section" className="mb-4 text-3xl md:text-4xl">
            What Our Community Says
          </Heading>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real experiences from travelers and guides who've found their perfect match on Travody.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              {stat.value === "4.9" && (
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              )}
              <p className="text-gray-600 font-medium text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{testimonial.date}</span>
                </div>
                
                <p className="text-gray-700 mb-5 italic leading-relaxed text-sm">
                  "{testimonial.review}"
                </p>
                
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{testimonial.author}</p>
                  <p className="text-xs text-gray-600 mb-3">{testimonial.location}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {testimonial.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
