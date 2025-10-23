import Header from '@/components/Header';
import GuiderDashboard from '@/components/GuiderDashboard';

export default function GuiderDashboardPage() {
  const user = {
    name: 'Raunak',
    type: 'guider' as const,
    isVerified: true
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="pt-16">
        <GuiderDashboard />
      </div>
    </div>
  );
}

