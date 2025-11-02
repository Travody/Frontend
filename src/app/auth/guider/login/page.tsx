import AppLayout from '@/components/layout/AppLayout';
import GuiderLoginForm from '@/components/auth/GuiderLoginForm';
import AuthSidebar from '@/components/auth/AuthSidebar';

export default function GuiderLoginPage() {
  return (
    <AppLayout>
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <GuiderLoginForm />
        </div>
        <AuthSidebar 
          title="Connect with travelers worldwide."
          features={[
            { icon: "💰", text: "Connect & Earn" },
            { icon: "📈", text: "Grow Your Reach" },
            { icon: "🏷️", text: "Build Your Brand" }
          ]}
          image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        />
      </div>
    </AppLayout>
  );
}

