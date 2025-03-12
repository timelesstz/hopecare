import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, setDoc, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useFirebaseAuth } from '../../../context/FirebaseAuthContext';
import { Edit2, Trash2, AlertCircle, Search, CheckCircle, XCircle, DollarSign, Mail, Phone, Heart, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFirestoreOperation } from '../../../utils/firestoreRetry';
import { logFirestoreError, isPermissionError } from '../../../utils/firestoreErrorHandler';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalDonated?: number;
  donationCount?: number;
  preferredCauses?: string[];
  isAnonymous?: boolean;
  isRecurring?: boolean;
  created_at: any;
  last_login?: any;
}

const DonorsPage: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [addingDonor, setAddingDonor] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [noDonorsFound, setNoDonorsFound] = useState<boolean>(false);
  const [creatingDonor, setCreatingDonor] = useState<boolean>(false);
  const [newDonor, setNewDonor] = useState({
    name: '',
    email: '',
    phone: '',
    preferredCauses: [] as string[],
    isAnonymous: false,
    isRecurring: false
  });

  useEffect(() => {
    // Check if user has admin permissions
    if (user && user.role === 'ADMIN') {
      fetchDonors();
    } else {
      setError('You do not have permission to access this page');
      toast.error('Access denied. Admin permissions required.');
    }
  }, [user]);

  const createSampleDonor = async () => {
    try {
      setCreatingDonor(true);
      
      const result = await safeFirestoreOperation(
        async () => {
          // Create a new donor user
          const sampleDonor = {
            name: 'Jane Donor',
            email: 'donor@hopecare.org',
            phone: '+1234567890',
            role: 'DONOR',
            status: 'ACTIVE',
            totalDonated: 1000,
            donationCount: 3,
            preferredCauses: ['Education', 'Health', 'Poverty Relief'],
            isAnonymous: false,
            isRecurring: true,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            created_by: user?.email || 'system'
          };
          
          const newDonorRef = doc(collection(db, 'users'));
          await setDoc(newDonorRef, sampleDonor);
          return newDonorRef.id;
        },
        'Failed to create sample donor user',
        'donors-create-sample'
      );
      
      if (result) {
        toast.success('Sample donor user created successfully!');
        setNoDonorsFound(false);
        fetchDonors();
      }
    } catch (error) {
      logFirestoreError(error, 'donors-create-sample-outer');
      toast.error('Failed to create sample donor user');
    } finally {
      setCreatingDonor(false);
    }
  };

  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoDonorsFound(false);

      const result = await safeFirestoreOperation(
        async () => {
          const donorsQuery = query(
            collection(db, 'users'),
            where('role', '==', 'DONOR'),
            orderBy('created_at', 'desc')
          );
          
          const donorsSnapshot = await getDocs(donorsQuery);
          
          if (donorsSnapshot.empty) {
            // No donors found, but the query worked
            return { empty: true, docs: [] };
          }
          
          const donorsList: Donor[] = [];
          donorsSnapshot.forEach((doc) => {
            try {
              const data = doc.data();
              donorsList.push({
                id: doc.id,
                name: data.name || 'Anonymous Donor',
                email: data.email,
                phone: data.phone || 'N/A',
                role: data.role,
                status: data.status || 'ACTIVE',
                totalDonated: data.totalDonated || 0,
                donationCount: data.donationCount || 0,
                preferredCauses: data.preferredCauses || [],
                isAnonymous: data.isAnonymous || false,
                isRecurring: data.isRecurring || false,
                created_at: data.created_at,
                last_login: data.last_login
              });
            } catch (docError) {
              logFirestoreError(docError, `donors-processing-doc-${doc.id}`);
              // Continue processing other documents
            }
          });
          
          return { empty: false, docs: donorsList };
        },
        'Failed to fetch donor users. Please try again later.',
        'donors-fetch'
      );
      
      if (!result) {
        // The operation failed and error was already handled by safeFirestoreOperation
        setError('Failed to fetch donor users');
        return;
      }
      
      if (result.empty) {
        setDonors([]);
        setError('No donor users found. Donors can sign up when making a donation.');
        setNoDonorsFound(true);
        return;
      }
      
      setDonors(result.docs);
    } catch (err) {
      // This catch is for any errors not caught by safeFirestoreOperation
      logFirestoreError(err, 'donors-fetch-outer');
      
      // Special handling for missing index errors
      if (err instanceof Error && err.message.includes('requires an index')) {
        const indexUrl = err.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
        if (indexUrl) {
          setError(`This query requires a Firestore index. Please create it using this URL: ${indexUrl}`);
          
          toast.error(
            `Missing Firestore index. Create it here: ${indexUrl}`,
            { 
              duration: 10000,
              style: {
                maxWidth: '500px',
                wordBreak: 'break-word'
              }
            }
          );
          return;
        }
      }
      
      setError('An unexpected error occurred while fetching donor users');
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonor) return;
    
    const result = await safeFirestoreOperation(
      async () => {
        const donorRef = doc(db, 'users', editingDonor.id);
        await updateDoc(donorRef, {
          name: editingDonor.name,
          phone: editingDonor.phone,
          status: editingDonor.status,
          preferredCauses: editingDonor.preferredCauses,
          isAnonymous: editingDonor.isAnonymous,
          isRecurring: editingDonor.isRecurring,
          updated_at: serverTimestamp(),
          updated_by: user?.email || 'system'
        });
        return true;
      },
      'Failed to update donor',
      'donors-update'
    );
    
    if (result) {
      toast.success('Donor updated successfully!');
      setEditingDonor(null);
      fetchDonors();
    }
  };

  const handleDeleteDonor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donor?')) return;
    
    const result = await safeFirestoreOperation(
      async () => {
        // Delete from Firestore
        const donorRef = doc(db, 'users', id);
        await deleteDoc(donorRef);
        return true;
      },
      'Failed to delete donor',
      'donors-delete'
    );
    
    if (result) {
      toast.success('Donor deleted successfully!');
      fetchDonors();
    }
  };

  const handleToggleStatus = async (donor: Donor) => {
    const result = await safeFirestoreOperation(
      async () => {
        const donorRef = doc(db, 'users', donor.id);
        await updateDoc(donorRef, {
          status: donor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
          updated_at: serverTimestamp(),
          updated_by: user?.email || 'system'
        });
        return true;
      },
      'Failed to update donor status',
      'donors-toggle-status'
    );
    
    if (result) {
      toast.success(`Donor ${donor.status === 'ACTIVE' ? 'deactivated' : 'activated'} successfully!`);
      fetchDonors();
    }
  };

  const handleCauseChange = (cause: string) => {
    if (!editingDonor) return;
    
    const updatedCauses = editingDonor.preferredCauses?.includes(cause)
      ? editingDonor.preferredCauses.filter(c => c !== cause)
      : [...(editingDonor.preferredCauses || []), cause];
    
    setEditingDonor({
      ...editingDonor,
      preferredCauses: updatedCauses
    });
  };

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await safeFirestoreOperation(
      async () => {
        // In a real app, you would send an invitation email here
        // For this demo, we'll just create the user directly
        const newDonorRef = doc(collection(db, 'users'));
        await setDoc(newDonorRef, {
          name: newDonor.name,
          email: newDonor.email,
          phone: newDonor.phone || '',
          role: 'DONOR',
          status: 'ACTIVE',
          totalDonated: 0,
          donationCount: 0,
          preferredCauses: newDonor.preferredCauses,
          isAnonymous: newDonor.isAnonymous,
          isRecurring: newDonor.isRecurring,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          created_by: user?.email || 'system'
        });
        return newDonorRef.id;
      },
      'Failed to add donor',
      'donors-add'
    );
    
    if (result) {
      toast.success('Donor added successfully!');
      setAddingDonor(false);
      setNewDonor({
        name: '',
        email: '',
        phone: '',
        preferredCauses: [],
        isAnonymous: false,
        isRecurring: false
      });
      fetchDonors();
    }
  };

  const handleNewDonorCauseChange = (cause: string) => {
    const updatedCauses = newDonor.preferredCauses.includes(cause)
      ? newDonor.preferredCauses.filter(c => c !== cause)
      : [...newDonor.preferredCauses, cause];
    
    setNewDonor({
      ...newDonor,
      preferredCauses: updatedCauses
    });
  };

  const filteredDonors = donors.filter(donor => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchLower) ||
      donor.email.toLowerCase().includes(searchLower) ||
      (donor.phone && donor.phone.includes(searchTerm)) ||
      donor.preferredCauses?.some(cause => cause.toLowerCase().includes(searchLower));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && donor.status === filterStatus;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
        <button
          onClick={() => setAddingDonor(true)}
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center"
        >
          <UserPlus size={18} className="mr-2" />
          Add Donor
        </button>
      </div>

      {noDonorsFound ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <p className="font-medium">No donor users found</p>
          </div>
          <p className="text-sm mt-2 mb-3">
            There are no donor users in the database. You can create a sample donor user or wait for donors to sign up when making donations.
          </p>
          <div className="flex justify-end">
            <button
              onClick={createSampleDonor}
              disabled={creatingDonor}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingDonor ? 'Creating...' : 'Create Sample Donor'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center flex-1">
                <Search size={20} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">
                  Status:
                </label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {loading && !editingDonor ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" color="primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <p>{error}</p>
              </div>
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-md mb-6 text-center">
              <DollarSign size={40} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No donors found</p>
              <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donations
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preferences
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDonors.map((donor) => (
                      <tr key={donor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-medium">{donor.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {donor.name}
                                {donor.isAnonymous && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    Anonymous
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">Donor</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail size={14} className="mr-1" /> {donor.email}
                          </div>
                          {donor.phone && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone size={14} className="mr-1" /> {donor.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              donor.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {donor.status}
                          </span>
                          {donor.isRecurring && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                              Recurring
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(donor.totalDonated || 0)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donor.donationCount || 0} donation{donor.donationCount !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {donor.preferredCauses && donor.preferredCauses.length > 0 ? (
                              donor.preferredCauses.map((cause, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  {cause}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No preferences</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(donor.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(donor)}
                              className={`p-1 rounded-full ${
                                donor.status === 'ACTIVE'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={donor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {donor.status === 'ACTIVE' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                            </button>
                            <button
                              onClick={() => setEditingDonor(donor)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteDonor(donor.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Edit Donor Modal */}
          {editingDonor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Edit Donor</h2>
                <form onSubmit={handleUpdateDonor}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingDonor.name}
                        onChange={(e) => setEditingDonor({ ...editingDonor, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingDonor.email}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editingDonor.phone || ''}
                        onChange={(e) => setEditingDonor({ ...editingDonor, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingDonor.status}
                        onChange={(e) => setEditingDonor({ ...editingDonor, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferences</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="anonymous"
                            checked={editingDonor.isAnonymous || false}
                            onChange={() => setEditingDonor({ ...editingDonor, isAnonymous: !editingDonor.isAnonymous })}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                          />
                          <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                            Anonymous Donor
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="recurring"
                            checked={editingDonor.isRecurring || false}
                            onChange={() => setEditingDonor({ ...editingDonor, isRecurring: !editingDonor.isRecurring })}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                          />
                          <label htmlFor="recurring" className="ml-2 block text-sm text-gray-900">
                            Recurring Donor
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Causes</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Education', 'Health', 'Environment', 'Poverty Relief', 'Community Development', 'Youth Programs', 'Elderly Care', 'Disaster Relief', 'Animal Welfare'].map((cause) => (
                          <div key={cause} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`cause-${cause}`}
                              checked={editingDonor.preferredCauses?.includes(cause) || false}
                              onChange={() => handleCauseChange(cause)}
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`cause-${cause}`} className="ml-2 block text-sm text-gray-900">
                              {cause}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                    >
                      Update Donor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DonorsPage;