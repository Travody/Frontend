import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const verificationSteps = [
  {
    id: 1,
    title: "Basic Profile Information",
    status: "completed",
    icon: CheckCircle
  },
  {
    id: 2,
    title: "Video Recording",
    status: "completed",
    icon: CheckCircle
  },
  {
    id: 3,
    title: "E-Sign Declaration",
    status: "current",
    icon: Clock
  },
  {
    id: 4,
    title: "Approval",
    status: "pending",
    icon: AlertCircle
  }
];

export default function GuiderVerification() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-primary-600 rounded-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hello, Raunak ✨</h1>
            <p className="text-lg">your account is not verified. Please verify to start earning.</p>
          </div>
        </div>
      </div>

      {/* Verification Progress Banner */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verification in Progress</h3>
              <p className="text-sm text-gray-600">Complete all steps to get verified</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Complete your verification</h2>
        
        <div className="flex items-center justify-between mb-8">
          {verificationSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  step.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : step.status === 'current'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-bold">{step.id}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{step.title}</p>
                {index < verificationSteps.length - 1 && (
                  <div className={`w-full h-0.5 mt-6 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Content */}
        <div className="border border-gray-200 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">E-Sign Declaration</h3>
          <p className="text-gray-600 mb-6">
            Please review and sign the declaration to complete your verification process.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Declaration Terms:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• I confirm that all information provided is accurate and truthful</li>
              <li>• I agree to follow Travody's community guidelines and safety standards</li>
              <li>• I understand that providing false information may result in account suspension</li>
              <li>• I consent to background verification and reference checks</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold">
              Sign Declaration
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
              Save for Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

