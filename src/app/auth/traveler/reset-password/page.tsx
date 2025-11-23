import AppLayout from '@/components/layout/AppLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import AuthSidebar from '@/components/auth/AuthSidebar';

export default function TravelerResetPasswordPage() {
  return (
    <AppLayout>
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <ResetPasswordForm 
            userType="traveler" 
            loginPath="/auth/traveler/login"
          />
        </div>
        <AuthSidebar 
          title="Set a new secure password."
          features={[
            { icon: "🔒", text: "Strong Password Required" },
            { icon: "✓", text: "OTP Verified" },
            { icon: "🛡️", text: "Secure Process" }
          ]}
          image="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        />
      </div>
    </AppLayout>
  );
}

