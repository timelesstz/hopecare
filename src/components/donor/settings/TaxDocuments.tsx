import { Download } from 'lucide-react';

interface TaxDocument {
  year: number;
  type: string;
  downloadUrl: string;
}

const TaxDocuments: React.FC = () => {
  const documents: TaxDocument[] = [
    {
      year: 2023,
      type: 'Donation Summary',
      downloadUrl: '#'
    },
    {
      year: 2022,
      type: 'Donation Summary',
      downloadUrl: '#'
    },
    {
      year: 2021,
      type: 'Donation Summary',
      downloadUrl: '#'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Tax Documents</h3>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.year} className="flex items-center justify-between p-4 border rounded-lg">
            <span className="font-medium text-gray-900">
              {doc.year} {doc.type}
            </span>
            <button className="flex items-center text-rose-600 hover:text-rose-700">
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxDocuments;