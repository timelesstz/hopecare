import { Bell, Clock, Shield, User } from 'lucide-react';

interface VolunteerSettingsProps {
  volunteer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    availability: {
      weekdays: boolean;
      weekends: boolean;
      evenings: boolean;
    };
  };
}

const VolunteerSettings: React.FC<VolunteerSettingsProps> = ({ volunteer }) => {
  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              defaultValue={volunteer.firstName}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              defaultValue={volunteer.lastName}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              defaultValue={volunteer.email}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              defaultValue={volunteer.phone}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Availability Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Availability</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked={volunteer.availability.weekdays}
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Available on Weekdays</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked={volunteer.availability.weekends}
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Available on Weekends</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked={volunteer.availability.evenings}
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Available in Evenings</span>
          </label>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Event Reminders</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Team Updates</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Certification Expiry Alerts</span>
          </label>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Show profile to other volunteers</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Allow team members to contact me</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition">
          Cancel
        </button>
        <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default VolunteerSettings;