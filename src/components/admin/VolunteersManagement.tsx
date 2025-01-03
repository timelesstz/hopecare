import React, { useState } from 'react';
import { User, Search, Mail, Phone, Award, Clock } from 'lucide-react';

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  hoursLogged: number;
  skills: string[];
}

const VolunteersManagement = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 123-4567",
      status: "active",
      joinDate: "2024-01-15",
      hoursLogged: 45,
      skills: ["Teaching", "First Aid", "Event Planning"]
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@example.com",
      phone: "(555) 987-6543",
      status: "active",
      joinDate: "2024-02-01",
      hoursLogged: 32,
      skills: ["Photography", "Social Media", "Gardening"]
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Volunteers Management</h2>
        <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition">
          Add Volunteer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search volunteers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <select className="ml-4 border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500">
              <option value="all">All Volunteers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {volunteers.map((volunteer) => (
              <div key={volunteer.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{volunteer.name}</h3>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          {volunteer.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2" />
                          {volunteer.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    volunteer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {volunteer.status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{volunteer.hoursLogged} hours</p>
                      <p className="text-xs text-gray-500">Total time</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Level 2</p>
                      <p className="text-xs text-gray-500">Volunteer rank</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Skills</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {volunteer.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button className="text-sm text-rose-600 hover:text-rose-700">View Profile</button>
                  <button className="text-sm text-gray-600 hover:text-gray-700">Edit Details</button>
                  <button className="text-sm text-gray-600 hover:text-gray-700">Manage Access</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteersManagement;