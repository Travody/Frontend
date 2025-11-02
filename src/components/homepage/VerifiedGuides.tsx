import { Shield, CheckCircle, Star, User, Phone, MapPin, Award } from 'lucide-react';

const features = [
  {
    icon: User,
    title: "Identity Verification",
    items: [
      "Government ID verification",
      "Background checks",
      "Professional credentials",
      "Reference verification"
    ]
  },
  {
    icon: Shield,
    title: "Safety First",
    items: [
      "Insurance coverage included",
      "24/7 emergency support",
      "Real-time location tracking",
      "Safety training certified"
    ]
  },
  {
    icon: Star,
    title: "Quality Assured",
    items: [
      "Continuous rating monitoring",
      "Regular training updates",
      "Customer feedback system",
      "Performance-based rewards"
    ]
  }
];

export default function VerifiedGuides() {
  return (
    <section className="py-16 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white mr-2" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Verified & Trusted Guides
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                </div>
                
                <ul className="space-y-3">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

