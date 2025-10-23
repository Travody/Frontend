import Header from '@/components/Header';
import GuiderVerification from '@/components/GuiderVerification';

export default function GuiderVerificationPage() {
  const user = {
    name: 'Raunak',
    type: 'guider' as const,
    isVerified: false
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="pt-16">
        <GuiderVerification />
      </div>
    </div>
  );
}

