import Header from '@/components/Header';
import TravelerLoginForm from '@/components/TravelerLoginForm';
import AuthSidebar from '@/components/AuthSidebar';

export default function TravelerLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-[calc(100vh-64px)] pt-16">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <TravelerLoginForm />
        </div>
        <AuthSidebar 
          title="Join a world of authentic travel experiences."
          features={[
            { icon: "✓", text: "Verified Local Guides" },
            { icon: "📅", text: "Seamless Trip Booking" },
            { icon: "✏️", text: "Custom Travel Plans" }
          ]}
          image="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        />
      </div>
    </div>
  );
}

