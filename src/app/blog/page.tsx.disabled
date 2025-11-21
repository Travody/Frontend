import AppLayout from '@/components/layout/AppLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Hidden Gems in Mumbai You Must Visit',
    excerpt: 'Discover the lesser-known attractions in Mumbai that showcase the city\'s rich culture and history beyond the usual tourist spots.',
    author: 'Priya Sharma',
    date: '2024-11-15',
    readTime: '5 min read',
    category: 'Destinations',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
  },
  {
    id: '2',
    title: 'How to Choose the Perfect Local Guide',
    excerpt: 'A comprehensive guide to finding and selecting the right local guide for your travel needs, ensuring an authentic and memorable experience.',
    author: 'Raj Patel',
    date: '2024-11-10',
    readTime: '7 min read',
    category: 'Tips',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  },
  {
    id: '3',
    title: 'Sustainable Tourism: Traveling Responsibly in India',
    excerpt: 'Learn how to travel sustainably and support local communities while exploring the beautiful destinations across India.',
    author: 'Anita Desai',
    date: '2024-11-05',
    readTime: '6 min read',
    category: 'Sustainability',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  },
  {
    id: '4',
    title: 'Festival Season in India: A Traveler\'s Guide',
    excerpt: 'Experience the vibrant festivals of India with our guide to the best times to visit and how to participate in local celebrations.',
    author: 'Vikram Singh',
    date: '2024-10-28',
    readTime: '8 min read',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
  },
  {
    id: '5',
    title: 'Street Food Adventures: Mumbai Edition',
    excerpt: 'Embark on a culinary journey through Mumbai\'s famous street food scene with local guides who know the best spots.',
    author: 'Meera Joshi',
    date: '2024-10-20',
    readTime: '5 min read',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  },
  {
    id: '6',
    title: 'Photography Tips for Travelers in India',
    excerpt: 'Capture stunning memories of your Indian adventure with these photography tips from professional travel photographers.',
    author: 'Arjun Mehta',
    date: '2024-10-15',
    readTime: '6 min read',
    category: 'Tips',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
  },
];

const categories = ['All', 'Destinations', 'Tips', 'Culture', 'Food', 'Sustainability'];

export default function BlogPage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <BookOpen className="h-16 w-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Travel Blog
            </h1>
            <p className="text-xl text-white/90">
              Stories, tips, and insights from travelers and guides across India
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          {/* Featured Post */}
          {blogPosts.length > 0 && (
            <div className="mb-12">
              <Card className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src={blogPosts[0].image}
                      alt={blogPosts[0].title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <CardContent className="md:w-1/2 p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4">{blogPosts[0].category}</Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {blogPosts[0].title}
                    </h2>
                    <p className="text-gray-600 mb-6">{blogPosts[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(blogPosts[0].date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {blogPosts[0].readTime}
                      </div>
                    </div>
                    <Link
                      href={`/blog/${blogPosts[0].id}`}
                      className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
                    >
                      Read More <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}

          {/* Blog Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(1).map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <Badge className="w-fit mb-3">{post.category}</Badge>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{post.author}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 text-sm"
                    >
                      Read More <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Newsletter CTA */}
          <Card className="mt-12 bg-primary-50 border-primary-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Stay Updated
              </h3>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter for the latest travel tips, stories, and exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </AppLayout>
  );
}

