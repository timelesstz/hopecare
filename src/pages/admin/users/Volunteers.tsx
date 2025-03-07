import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, setDoc, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useFirebaseAuth } from '../../../context/FirebaseAuthContext';
import { Edit2, Trash2, AlertCircle, Search, CheckCircle, XCircle, UserCheck, Mail, Phone, UserPlus, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFirestoreOperation } from '../../../utils/firestoreRetry';
import { logFirestoreError, isPermissionError } from '../../../utils/firestoreErrorHandler';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  skills?: string[];
  availability?: {
    weekdays?: boolean;
    weekends?: boolean;
    evenings?: boolean;
  };
  interests?: string[];
  created_at: any;
  last_login?: any;
}

const VolunteersPage: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [showAddVolunteer, setShowAddVolunteer] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [noVolunteersFound, setNoVolunteersFound] = useState<boolean>(false);
  const [creatingVolunteer, setCreatingVolunteer] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has admin permissions
    if (user && user.role === 'ADMIN') {
      fetchVolunteers();
    } else {
      setError('You do not have permission to access this page');
      toast.error('Access denied. Admin permissions required.');
    }
  }, [user]);

  const createSampleVolunteer = async () => {
    try {
      setCreatingVolunteer(true);
      
      const result = await safeFirestoreOperation(
        async () => {
          // Create a new volunteer user
          const sampleVolunteer = {
            name: 'John Volunteer',
            email: 'volunteer@hopecare.org',
            phone: '+1234567890',
            role: 'VOLUNTEER',
            status: 'ACTIVE',
            skills: ['Teaching', 'First Aid', 'Cooking'],
            availability: {
              weekdays: true,
              weekends: true,
              evenings: false
            },
            interests: ['Education', 'Health', 'Community Development'],
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            created_by: user?.email || 'system'
          };
          
          const newVolunteerRef = doc(collection(db, 'users'));
          await setDoc(newVolunteerRef, sampleVolunteer);
          return newVolunteerRef.id;
        },
        'Failed to create sample volunteer user',
        'volunteers-create-sample'
      );
      
      if (result) {
        toast.success('Sample volunteer user created successfully!');
        setNoVolunteersFound(false);
        fetchVolunteers();
      }
    } catch (error) {
      logFirestoreError(error, 'volunteers-create-sample-outer');
      toast.error('Failed to create sample volunteer user');
    } finally {
      setCreatingVolunteer(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoVolunteersFound(false);

      try {
        const volunteersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'VOLUNTEER'),
          orderBy('created_at', 'desc')
        );
        
        try {
          const volunteersSnapshot = await getDocs(volunteersQuery);
          
          if (volunteersSnapshot.empty) {
            // No volunteers found, but the query worked
            setVolunteers([]);
            setError('No volunteer users found. Volunteers can sign up through the volunteer page.');
            setNoVolunteersFound(true);
            return;
          }
          
          const volunteersList: Volunteer[] = [];
          volunteersSnapshot.forEach((doc) => {
            try {
              const data = doc.data();
              volunteersList.push({
                id: doc.id,
                name: data.name || 'Unnamed Volunteer',
                email: data.email,
                phone: data.phone || 'N/A',
                role: data.role,
                status: data.status || 'PENDING',
                skills: data.skills || [],
                availability: data.availability || {
                  weekdays: false,
                  weekends: false,
                  evenings: false
                },
                interests: data.interests || [],
                created_at: data.created_at,
                last_login: data.last_login
              });
            } catch (docError) {
              logFirestoreError(docError, `volunteers-processing-doc-${doc.id}`);
              // Continue processing other documents
            }
          });
          
          setVolunteers(volunteersList);
        } catch (queryError) {
          logFirestoreError(queryError, 'volunteers-query-execution');
          throw queryError;
        }
      } catch (err) {
        logFirestoreError(err, 'volunteers-collection-access');
        
        // Check if it's a permission error
        if (isPermissionError(err)) {
          setError('You do not have permission to access volunteer users');
          toast.error('You do not have permission to access volunteer users');
        } else if (err instanceof Error && err.message.includes('collection not found')) {
          setError('Users collection does not exist. Please check your database setup.');
          toast.error('Users collection not found. Please contact system administrator.');
        } else {
          setError(`Failed to fetch volunteer users: ${err instanceof Error ? err.message : 'Unknown error'}`);
          toast.error('Failed to fetch volunteer users. Please try again later.');
        }
      }
    } catch (err) {
      logFirestoreError(err, 'volunteers-fetch-outer');
      setError('An unexpected error occurred while fetching volunteer users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer) return;
    
    const result = await safeFirestoreOperation(
      async () => {
        const volunteerRef = doc(db, 'users', editingVolunteer.id);
        await updateDoc(volunteerRef, {
          name: editingVolunteer.name,
          phone: editingVolunteer.phone,
          status: editingVolunteer.status,
          skills: editingVolunteer.skills,
          availability: editingVolunteer.availability,
          interests: editingVolunteer.interests,
          updated_at: serverTimestamp(),
          updated_by: user?.email || 'system'
        });
        return true;
      },
      'Failed to update volunteer',
      'volunteers-update'
    );
    
    if (result) {
      toast.success('Volunteer updated successfully!');
      setEditingVolunteer(null);
      fetchVolunteers();
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer?')) return;
    
    const result = await safeFirestoreOperation(
      async () => {
        const volunteerRef = doc(db, 'users', id);
        await deleteDoc(volunteerRef);
        return true;
      },
      'Failed to delete volunteer',
      'volunteers-delete'
    );
    
    if (result) {
      toast.success('Volunteer deleted successfully!');
      fetchVolunteers();
    }
  };

  const handleToggleStatus = async (volunteer: Volunteer, newStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING') => {
    const result = await safeFirestoreOperation(
      async () => {
        const volunteerRef = doc(db, 'users', volunteer.id);
        await updateDoc(volunteerRef, {
          status: newStatus,
          updated_at: serverTimestamp(),
          updated_by: user?.email || 'system'
        });
        return true;
      },
      'Failed to update volunteer status',
      'volunteers-toggle-status'
    );
    
    if (result) {
      toast.success(`Volunteer ${newStatus === 'ACTIVE' ? 'activated' : newStatus === 'INACTIVE' ? 'deactivated' : 'set to pending'} successfully!`);
      fetchVolunteers();
    }
  };

  const handleSkillChange = (skill: string) => {
    if (!editingVolunteer) return;
    
    const updatedSkills = editingVolunteer.skills?.includes(skill)
      ? editingVolunteer.skills.filter(s => s !== skill)
      : [...(editingVolunteer.skills || []), skill];
    
    setEditingVolunteer({
      ...editingVolunteer,
      skills: updatedSkills
    });
  };

  const handleInterestChange = (interest: string) => {
    if (!editingVolunteer) return;
    
    const updatedInterests = editingVolunteer.interests?.includes(interest)
      ? editingVolunteer.interests.filter(i => i !== interest)
      : [...(editingVolunteer.interests || []), interest];
    
    setEditingVolunteer({
      ...editingVolunteer,
      interests: updatedInterests
    });
  };

  const handleAvailabilityChange = (key: keyof Volunteer['availability']) => {
    if (!editingVolunteer || !editingVolunteer.availability) return;
    
    setEditingVolunteer({
      ...editingVolunteer,
      availability: {
        ...editingVolunteer.availability,
        [key]: !editingVolunteer.availability[key]
      }
    });
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      volunteer.name.toLowerCase().includes(searchLower) ||
      volunteer.email.toLowerCase().includes(searchLower) ||
      (volunteer.phone && volunteer.phone.includes(searchTerm)) ||
      volunteer.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      volunteer.interests?.some(interest => interest.toLowerCase().includes(searchLower));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && volunteer.status === filterStatus;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
        <button
          onClick={() => setShowAddVolunteer(true)}
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center"
        >
          <UserPlus size={18} className="mr-2" />
          Add Volunteer
        </button>
      </div>

      {noVolunteersFound ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <p className="font-medium">No volunteer users found</p>
          </div>
          <p className="text-sm mt-2 mb-3">
            There are no volunteer users in the database. You can create a sample volunteer user or wait for volunteers to sign up through the volunteer page.
          </p>
          <div className="flex justify-end">
            <button
              onClick={createSampleVolunteer}
              disabled={creatingVolunteer}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingVolunteer ? 'Creating...' : 'Create Sample Volunteer'}
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
                  placeholder="Search volunteers..."
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
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {loading && !editingVolunteer ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <p>{error}</p>
              </div>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-md mb-6 text-center">
              <Heart size={40} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No volunteers found</p>
              <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volunteer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skills
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
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
                    {filteredVolunteers.map((volunteer) => (
                      <tr key={volunteer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">{volunteer.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                              <div className="text-sm text-gray-500">Volunteer</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail size={14} className="mr-1" /> {volunteer.email}
                          </div>
                          {volunteer.phone && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone size={14} className="mr-1" /> {volunteer.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(volunteer.status)}`}
                          >
                            {volunteer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {volunteer.skills && volunteer.skills.length > 0 ? (
                              volunteer.skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No skills listed</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {volunteer.availability?.weekdays && <div>Weekdays</div>}
                            {volunteer.availability?.weekends && <div>Weekends</div>}
                            {volunteer.availability?.evenings && <div>Evenings</div>}
                            {(!volunteer.availability?.weekdays && !volunteer.availability?.weekends && !volunteer.availability?.evenings) && (
                              <div>Not specified</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(volunteer.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {volunteer.status === 'PENDING' && (
                              <button
                                onClick={() => handleToggleStatus(volunteer, 'ACTIVE')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {volunteer.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleToggleStatus(volunteer, 'INACTIVE')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                                title="Deactivate"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            {volunteer.status === 'INACTIVE' && (
                              <button
                                onClick={() => handleToggleStatus(volunteer, 'ACTIVE')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                                title="Activate"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => setEditingVolunteer(volunteer)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteVolunteer(volunteer.id)}
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

          {/* Edit Volunteer Modal */}
          {editingVolunteer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Edit Volunteer</h2>
                <form onSubmit={handleUpdateVolunteer}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingVolunteer.name}
                        onChange={(e) => setEditingVolunteer({ ...editingVolunteer, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingVolunteer.email}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editingVolunteer.phone || ''}
                        onChange={(e) => setEditingVolunteer({ ...editingVolunteer, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingVolunteer.status}
                        onChange={(e) => setEditingVolunteer({ ...editingVolunteer, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'PENDING' })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="weekdays"
                          checked={editingVolunteer.availability?.weekdays || false}
                          onChange={() => handleAvailabilityChange('weekdays')}
                          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <label htmlFor="weekdays" className="ml-2 block text-sm text-gray-900">
                          Weekdays
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="weekends"
                          checked={editingVolunteer.availability?.weekends || false}
                          onChange={() => handleAvailabilityChange('weekends')}
                          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <label htmlFor="weekends" className="ml-2 block text-sm text-gray-900">
                          Weekends
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="evenings"
                          checked={editingVolunteer.availability?.evenings || false}
                          onChange={() => handleAvailabilityChange('evenings')}
                          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <label htmlFor="evenings" className="ml-2 block text-sm text-gray-900">
                          Evenings
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Teaching', 'Mentoring', 'Counseling', 'Administration', 'Event Planning', 'Fundraising', 'Marketing', 'IT Support', 'Medical'].map((skill) => (
                        <div key={skill} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`skill-${skill}`}
                            checked={editingVolunteer.skills?.includes(skill) || false}
                            onChange={() => handleSkillChange(skill)}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`skill-${skill}`} className="ml-2 block text-sm text-gray-900">
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Education', 'Health', 'Environment', 'Poverty Relief', 'Community Development', 'Youth Programs', 'Elderly Care', 'Disaster Relief', 'Animal Welfare'].map((interest) => (
                        <div key={interest} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`interest-${interest}`}
                            checked={editingVolunteer.interests?.includes(interest) || false}
                            onChange={() => handleInterestChange(interest)}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`interest-${interest}`} className="ml-2 block text-sm text-gray-900">
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingVolunteer(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Volunteer'}
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

export default VolunteersPage; 