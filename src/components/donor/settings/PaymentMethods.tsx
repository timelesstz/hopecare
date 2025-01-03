import React from 'react';
import { CreditCard, Plus } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const PaymentMethods: React.FC = () => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiry: '12/24',
      isDefault: true
    },
    {
      id: '2',
      type: 'Mastercard',
      last4: '5555',
      expiry: '08/25',
      isDefault: false
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">
                  {method.type} ending in {method.last4}
                  {method.isDefault && (
                    <span className="ml-2 text-xs text-rose-600">(Default)</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">Expires {method.expiry}</p>
              </div>
            </div>
            <button className="text-rose-600 hover:text-rose-700">Remove</button>
          </div>
        ))}
        <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-rose-500 hover:text-rose-600 transition flex items-center justify-center">
          <Plus className="h-5 w-5 mr-2" />
          Add New Payment Method
        </button>
      </div>
    </div>
  );
};

export default PaymentMethods;