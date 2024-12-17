import { Award, Calendar, Download, Plus } from 'lucide-react';

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}

const VolunteerCertifications = () => {
  const certifications: Certification[] = [
    {
      id: 1,
      name: "First Aid Certification",
      issuer: "Red Cross",
      date: "2023-06-15",
      expiryDate: "2024-06-15",
      status: "active"
    },
    {
      id: 2,
      name: "Child Safety Training",
      issuer: "Child Protection Services",
      date: "2023-08-01",
      expiryDate: "2024-08-01",
      status: "active"
    },
    {
      id: 3,
      name: "Food Safety Handler",
      issuer: "Health Department",
      date: "2023-03-15",
      expiryDate: "2024-03-15",
      status: "expired"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
        <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <div key={cert.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 text-rose-600" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">{cert.name}</h3>
                <p className="text-sm text-gray-500">{cert.issuer}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Issue Date:</span>
                <span className="text-gray-900">{new Date(cert.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Expiry Date:</span>
                <span className="text-gray-900">{new Date(cert.expiryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button className="text-gray-600 hover:text-gray-900 flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              <button className="text-rose-600 hover:text-rose-700 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Renew
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolunteerCertifications;