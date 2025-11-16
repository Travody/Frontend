import { FileText, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading } from '@/components/ui/heading';

export default function GuiderDashboard() {
  return (
    <Section variant="muted" className="py-8">
      <Container>
        {/* Welcome Banner */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <Heading as="h1" variant="page" className="mb-2">Hello, Raunak 👋</Heading>
                <p className="text-lg text-white/90">Your account is verified. Start Earning by creating plans.</p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-lg font-medium">Verified Account</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Plans</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">₹15,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No recent activity"
              description="Your recent activity will appear here"
            />
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

