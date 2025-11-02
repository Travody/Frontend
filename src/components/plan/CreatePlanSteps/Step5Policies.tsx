'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface Step7PoliciesProps {
  data: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isValid: boolean;
}

export default function Step7Policies({ data, onSubmit, isLoading, isValid }: Step7PoliciesProps) {
  const [formData, setFormData] = useState({
    cancellationPolicy: data.cancellationPolicy || '',
    termsAndConditions: data.termsAndConditions || '',
    specialInstructions: data.specialInstructions || ''
  });

  const [policyTemplates, setPolicyTemplates] = useState({
    cancellation: '',
    terms: '',
    instructions: ''
  });
  const isInitialMount = useRef(true);

  useEffect(() => {
    setFormData({
      cancellationPolicy: data.cancellationPolicy || '',
      termsAndConditions: data.termsAndConditions || '',
      specialInstructions: data.specialInstructions || ''
    });
    isInitialMount.current = true; // Reset on data change from parent
  }, [data]);

  // Sync formData to parent on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSubmit(formData);
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const applyTemplate = (type: string) => {
    const templates = {
      cancellation: {
        standard: `Cancellation Policy:

• Free cancellation up to 24 hours before the tour start time
• 50% refund for cancellations made 12-24 hours before the tour
• No refund for cancellations made less than 12 hours before the tour
• In case of weather-related cancellations, full refund or rescheduling will be offered
• No-show participants will not be eligible for any refund

Please contact us at least 24 hours in advance for any changes or cancellations.`,
        flexible: `Flexible Cancellation Policy:

• Free cancellation up to 48 hours before the tour start time
• 75% refund for cancellations made 24-48 hours before the tour
• 50% refund for cancellations made 12-24 hours before the tour
• 25% refund for cancellations made 6-12 hours before the tour
• No refund for cancellations made less than 6 hours before the tour

We understand that plans can change, so we offer flexible cancellation options.`
      },
      terms: {
        standard: `Terms and Conditions:

1. Booking and Payment:
   • Full payment is required at the time of booking
   • Prices are per person unless otherwise specified
   • All prices include applicable taxes

2. Tour Conduct:
   • Participants must arrive at the meeting point 10 minutes before the scheduled start time
   • Late arrivals may result in missing part of the tour without refund
   • Participants must follow the guide's instructions for safety reasons
   • Any disruptive behavior may result in removal from the tour

3. Safety and Health:
   • Participants are responsible for their own safety and health
   • Please inform us of any medical conditions or mobility issues
   • Follow all safety instructions provided by the guide

4. Liability:
   • We are not responsible for personal belongings lost or damaged during the tour
   • Participants engage in activities at their own risk
   • We reserve the right to modify or cancel tours due to safety concerns`,
        comprehensive: `Comprehensive Terms and Conditions:

1. Booking and Payment:
   • Full payment is required at the time of booking
   • Prices are per person and include all mentioned activities
   • Additional costs for optional activities are not included
   • Payment methods accepted: Credit/Debit cards, UPI, Net Banking

2. Tour Conduct and Behavior:
   • Participants must arrive 15 minutes before the scheduled start time
   • Late arrivals may result in missing part of the tour without refund
   • Participants must follow all guide instructions for safety
   • Disruptive, dangerous, or illegal behavior will result in immediate removal
   • Smoking and alcohol consumption are prohibited during the tour

3. Safety and Health Requirements:
   • Participants must be in good physical condition for the activities
   • Inform us of any medical conditions, allergies, or mobility issues
   • Follow all safety instructions and use provided safety equipment
   • Children under 12 must be accompanied by an adult

4. Liability and Insurance:
   • We carry public liability insurance
   • Participants are responsible for their own personal belongings
   • We are not liable for personal injury or property damage
   • Participants engage in activities at their own risk

5. Modifications and Cancellations:
   • We reserve the right to modify itineraries due to weather or safety concerns
   • Tours may be cancelled due to insufficient bookings (minimum 2 participants)
   • Alternative dates or full refund will be offered for cancelled tours`
      },
      instructions: {
        standard: `Special Instructions:

• Wear comfortable walking shoes
• Bring a water bottle and stay hydrated
• Apply sunscreen and wear a hat for sun protection
• Bring a camera to capture memories
• Dress appropriately for the weather and cultural sites
• Follow local customs and respect cultural sites
• Keep the environment clean - no littering`,
        detailed: `Detailed Special Instructions:

What to Bring:
• Comfortable walking shoes (no flip-flops)
• Water bottle (we can refill at various locations)
• Sunscreen, hat, and sunglasses
• Camera or smartphone for photos
• Small backpack or bag for personal items
• Cash for souvenirs and additional expenses

What to Wear:
• Comfortable, breathable clothing
• Modest attire for religious sites (covered shoulders and knees)
• Layers for changing weather conditions
• Comfortable walking shoes with good grip

Health and Safety:
• Stay hydrated throughout the tour
• Inform the guide of any medical conditions
• Follow all safety instructions
• Stay with the group at all times
• Use hand sanitizer when available

Cultural Considerations:
• Respect local customs and traditions
• Ask permission before taking photos of people
• Remove shoes when entering religious sites
• Keep voices low in sacred areas
• Don't touch or climb on monuments

Environmental Responsibility:
• Use reusable water bottles
• Dispose of waste in designated bins
• Don't pick flowers or disturb wildlife
• Stay on designated paths
• Leave no trace behind`
      }
    };

    const templateType = policyTemplates[type as keyof typeof policyTemplates];
    const templateCategory = templates[type as keyof typeof templates];
    
    if (templateType && templateCategory && templateCategory[templateType as keyof typeof templateCategory]) {
      const templateContent = templateCategory[templateType as keyof typeof templateCategory];
      handleInputChange(type, templateContent);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Policies & Terms</h2>
        <p className="text-gray-600">Set clear policies and terms for your tour</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cancellation Policy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            Cancellation Policy
          </label>
          
          <div className="mb-3">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setPolicyTemplates(prev => ({ ...prev, cancellation: 'standard' }));
                  applyTemplate('cancellation');
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Standard Policy
              </button>
              <button
                type="button"
                onClick={() => {
                  setPolicyTemplates(prev => ({ ...prev, cancellation: 'flexible' }));
                  applyTemplate('cancellation');
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Flexible Policy
              </button>
            </div>
          </div>
          
          <textarea
            value={formData.cancellationPolicy}
            onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Define your cancellation policy..."
          />
        </div>

        {/* Terms and Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Terms and Conditions
          </label>
          
          <div className="mb-3">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setPolicyTemplates(prev => ({ ...prev, terms: 'standard' }));
                  applyTemplate('terms');
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Standard Terms
              </button>
              <button
                type="button"
                onClick={() => {
                  setPolicyTemplates(prev => ({ ...prev, terms: 'comprehensive' }));
                  applyTemplate('terms');
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Comprehensive Terms
              </button>
            </div>
          </div>
          
          <textarea
            value={formData.termsAndConditions}
            onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Define your terms and conditions..."
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Special Instructions
          </label>
          
          <div className="mb-3">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setPolicyTemplates(prev => ({ ...prev, instructions: 'standard' }));
                  applyTemplate('instructions');
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Standard Instructions
              </button>
              <button
                type="button"
                onClick={() => {
                  setPolicyTemplates(prev => ({ ...prev, instructions: 'detailed' }));
                  applyTemplate('instructions');
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Detailed Instructions
              </button>
            </div>
          </div>
          
          <textarea
            value={formData.specialInstructions}
            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Provide special instructions for participants..."
          />
        </div>

        {/* Policy Tips */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Guidelines</h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"></CheckCircle>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Clear Communication:</strong> Use simple, easy-to-understand language for all policies.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"></CheckCircle>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Fair Policies:</strong> Ensure your policies are fair to both you and your customers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"></CheckCircle>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Legal Compliance:</strong> Ensure your policies comply with local laws and regulations.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"></CheckCircle>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Regular Updates:</strong> Review and update your policies regularly to reflect any changes.
                </p>
              </div>
            </div>
          </div>
        </div>


      </form>
    </div>
  );
}
