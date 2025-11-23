import AppLayout from '@/components/layout/AppLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import AuthSidebar from '@/components/auth/AuthSidebar';

export default function TravelerForgotPasswordPage() {
  return (
    <AppLayout>
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <ForgotPasswordForm 
            userType="traveler" 
            loginPath="/auth/traveler/login"
          />
        </div>
        <AuthSidebar 
          title="Reset your password securely."
          features={[
            { icon: "🔒", text: "Secure Password Reset" },
            { icon: "✉️", text: "OTP Verification" },
            { icon: "⚡", text: "Quick Recovery Process" }
          ]}
          image="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        />
      </div>
    </AppLayout>
  );
}

