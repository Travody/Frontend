import GuiderVerificationDashboard from '@/components/dashboard/GuiderVerificationDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function GuiderVerificationPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Please log in to access verification</div>;
  }
  
  return <GuiderVerificationDashboard />;
}