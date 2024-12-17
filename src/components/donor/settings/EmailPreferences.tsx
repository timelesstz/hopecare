import React from 'react';

interface EmailPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const EmailPreferences: React.FC = () => {
  const preferences: EmailPreference[] = [
    {
      id: 'receipts',
      label: 'Donation Receipts',
      description: 'Receive receipts for your donations immediately',
      enabled: true
    },
    {
      id: 'impact',
      label: 'Monthly Impact Reports',
      description: 'Get updates about how your donations are making a difference',
      enabled: true
    },
    {
      id: 'newsletter',
      label: 'Newsletter',
      description: 'Stay informed about our latest news and events',
      enabled: true
    },
    {
      id: 'campaigns',
      label: 'Campaign Updates',
      description: 'Receive updates about specific campaigns you support',
      enabled: false
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Preferences</h3>
      <div className="space-y-4">
        {preferences.map((pref) => (
          <div key={pref.id} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={pref.id}
                type="checkbox"
                defaultChecked={pref.enabled}
                className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor={pref.id} className="font-medium text-gray-700">
                {pref.label}
              </label>
              <p className="text-sm text-gray-500">{pref.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-6 text-rose-600 hover:text-rose-700 font-medium">
        Save Preferences
      </button>
    </div>
  );
};

export default EmailPreferences;