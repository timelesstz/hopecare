import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, setDoc, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';
import { Edit2, Trash2, AlertCircle, Search, CheckCircle, XCircle, Shield, Mail, Phone, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFirestoreOperation } from '../../../utils/firestoreRetry';
import { logFirestoreError, isPermissionError } from '../../../utils/firestoreErrorHandler';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions?: string[];
  created_at: any;
  last_login?: any;
}

const AdminsPage: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    permissions: ['dashboard', 'events', 'settings']
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [noAdminsFound, setNoAdminsFound] = useState<boolean>(false);
  const [creatingAdmin, setCreatingAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has admin permissions
    if (user && user.role === 'ADMIN') {
      fetchAdmins();
    } else {
      setError('You do not have permission to access this page');
      toast.error('Access denied. Admin permissions required.');
    }
  }, [user]);

  const createSampleAdmin = async () => {
    try {
      setCreatingAdmin(true);
      
      const result = await safeFirestoreOperation(
        async () => {
          // Create a new admin user
          const sampleAdmin = {
            name: 'Admin User',
            email: 'admin@hopecare.org',
            phone: '+1234567890',
            role: 'ADMIN',
            status: 'ACTIVE',
            permissions: ['dashboard', 'events', 'settings', 'users', 'donations', 'volunteers', 'reports'],
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            created_by: user?.email || 'system'
          };
          
          const newAdminRef = doc(collection(db, 'users'));
          await setDoc(newAdminRef, sampleAdmin);
          return newAdminRef.id;
        },
        'Failed to create sample admin user',
        'admins-create-sample'
      );
      
      if (result) {
        toast.success('Sample admin user created successfully!');
        setNoAdminsFound(false);
        fetchAdmins();
      }
    } catch (error) {
      logFirestoreError(error, 'admins-create-sample-outer');
      toast.error('Failed to create sample admin user');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoAdminsFound(false);

      const result = await safeFirestoreOperation(
        async () => {
          const adminsQuery = query(
            collection(db, 'users'),
            where('role', '==', 'ADMIN'),
            orderBy('created_at', 'desc')
          );
          
          const adminsSnapshot = await getDocs(adminsQuery);
          
          if (adminsSnapshot.empty) {
            // No admins found, but the query worked
            return { empty: true, docs: [] };
          }
          
          const adminsList: Admin[] = [];
          adminsSnapshot.forEach((doc) => {
            try {
              const data = doc.data();
              adminsList.push({
                id: doc.id,
                name: data.name || 'Unnamed Admin',
                email: data.email,
                phone: data.phone || 'N/A',
                role: data.role,
                status: data.status || 'ACTIVE',
                permissions: data.permissions || ['dashboard'],
                created_at: data.created_at,
                last_login: data.last_login
              });
            } catch (docError) {
              logFirestoreError(docError, `admins-processing-doc-${doc.id}`);
              // Continue processing other documents
            }
          });
          
          return { empty: false, docs: adminsList };
        },
        'Failed to fetch admin users. Please try again later.',
        'admins-fetch'
      );
      
      if (!result) {
        // The operation failed and error was already handled by safeFirestoreOperation
        setError('Failed to fetch admin users');
        return;
      }
      
      if (result.empty) {
        setAdmins([]);
        setError('No admin users found. Add your first admin user to get started.');
        setNoAdminsFound(true);
        return;
      }
      
      setAdmins(result.docs);
    } catch (err) {
      // This catch is for any errors not caught by safeFirestoreOperation
      logFirestoreError(err, 'admins-fetch-outer');
      
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
      
      setError('An unexpected error occurred while fetching admin users');
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    
    const result = await safeFirestoreOperation(
      async () => {
        const adminRef = doc(db, 'users', editingAdmin.id);
        await updateDoc(adminRef, {
          name: editingAdmin.name,
          phone: editingAdmin.phone,
          status: editingAdmin.status,
          permissions: editingAdmin.permissions,
          updated_at: serverTimestamp(),
          updated_by: user?.email || 'system'
        });
        return true;
      },
      'Failed to update admin',
      'admins-update'
    );
    
    if (result) {
      toast.success('Admin updated successfully!');
      setEditingAdmin(null);
      fetchAdmins();
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await safeFirestoreOperation(
      async () => {
        // In a real app, you would send an invitation email here
        // For this demo, we'll just create the user directly
        const newAdminRef = doc(collection(db, 'users'));
        await setDoc(newAdminRef, {
          name: newAdmin.name,
          email: newAdmin.email,
          phone: newAdmin.phone,
          role: 'ADMIN',
          status: 'ACTIVE',
          permissions: newAdmin.permissions,
          created_at: serverTimestamp(),
          created_by: user?.email || 'system'
        });
        return newAdminRef.id;
      },
      'Failed to add admin',
      'admins-add'
    );
    
    if (result) {
      toast.success('Admin added successfully!');
      setAddingAdmin(false);
      setNewAdmin({
        name: '',
        email: '',
        phone: '',
        permissions: ['dashboard', 'events', 'settings']
      });
      fetchAdmins();
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    const result = await safeFirestoreOperation(
      async () => {
        // Delete from Firestore
        const adminRef = doc(db, 'users', id);
        await deleteDoc(adminRef);
        return true;
      },
      'Failed to delete admin',
      'admins-delete'
    );
    
    if (result) {
      toast.success('Admin deleted successfully!');
      fetchAdmins();
    }
  };

  const handleToggleStatus = async (admin: Admin) => {
    const result = await safeFirestoreOperation(
      async () => {
        const adminRef = doc(db, 'users', admin.id);
        await updateDoc(adminRef, {
          status: admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
          updated_at: serverTimestamp(),
          updated_by: user?.email || 'system'
        });
        return true;
      },
      'Failed to update admin status',
      'admins-toggle-status'
    );
    
    if (result) {
      toast.success(`Admin ${admin.status === 'ACTIVE' ? 'deactivated' : 'activated'} successfully!`);
      fetchAdmins();
    }
  };

  const handlePermissionChange = (permission: string) => {
    if (!editingAdmin) return;
    
    const updatedPermissions = editingAdmin.permissions?.includes(permission)
      ? editingAdmin.permissions.filter(p => p !== permission)
      : [...(editingAdmin.permissions || []), permission];
    
    setEditingAdmin({
      ...editingAdmin,
      permissions: updatedPermissions
    });
  };

  const handleNewAdminPermissionChange = (permission: string) => {
    const updatedPermissions = newAdmin.permissions.includes(permission)
      ? newAdmin.permissions.filter(p => p !== permission)
      : [...newAdmin.permissions, permission];
    
    setNewAdmin({
      ...newAdmin,
      permissions: updatedPermissions
    });
  };

  const filteredAdmins = admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower) ||
      (admin.phone && admin.phone.includes(searchTerm));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && admin.status === filterStatus;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Administrators</h1>
        <button
          onClick={() => setAddingAdmin(true)}
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center"
        >
          <UserPlus size={18} className="mr-2" />
          Add Admin
        </button>
      </div>

      {noAdminsFound ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <p className="font-medium">No admin users found</p>
          </div>
          <p className="text-sm mt-2 mb-3">
            There are no admin users in the database. You need to create at least one admin user to manage the system.
          </p>
          <div className="flex justify-end">
            <button
              onClick={createSampleAdmin}
              disabled={creatingAdmin}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingAdmin ? 'Creating...' : 'Create Sample Admin'}
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
                  placeholder="Search admins..."
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

          {loading && !editingAdmin ? (
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
          ) : filteredAdmins.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-md mb-6 text-center">
              <Shield size={40} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No administrators found</p>
              <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
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
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-medium">{admin.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                              <div className="text-sm text-gray-500">Administrator</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail size={14} className="mr-1" /> {admin.email}
                          </div>
                          {admin.phone && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone size={14} className="mr-1" /> {admin.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              admin.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {admin.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {admin.permissions && admin.permissions.length > 0 ? (
                              admin.permissions.map((permission, index) => (
                                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                                  {permission}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(admin.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(admin)}
                              className={`p-1 rounded-full ${
                                admin.status === 'ACTIVE'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {admin.status === 'ACTIVE' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                            </button>
                            <button
                              onClick={() => setEditingAdmin(admin)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
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

          {/* Edit Admin Modal */}
          {editingAdmin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Edit Administrator</h2>
                <form onSubmit={handleUpdateAdmin}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingAdmin.name}
                        onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingAdmin.email}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editingAdmin.phone || ''}
                        onChange={(e) => setEditingAdmin({ ...editingAdmin, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingAdmin.status}
                        onChange={(e) => setEditingAdmin({ ...editingAdmin, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['dashboard', 'events', 'settings', 'users', 'donations', 'volunteers', 'reports'].map((permission) => (
                          <div key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`permission-${permission}`}
                              checked={editingAdmin.permissions?.includes(permission) || false}
                              onChange={() => handlePermissionChange(permission)}
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`permission-${permission}`} className="ml-2 block text-sm text-gray-900">
                              {permission.charAt(0).toUpperCase() + permission.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingAdmin(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Admin'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Admin Modal */}
          {addingAdmin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Add Administrator</h2>
                <form onSubmit={handleAddAdmin}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={newAdmin.phone}
                        onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['dashboard', 'events', 'settings', 'users', 'donations', 'volunteers', 'reports'].map((permission) => (
                          <div key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`new-permission-${permission}`}
                              checked={newAdmin.permissions.includes(permission)}
                              onChange={() => handleNewAdminPermissionChange(permission)}
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`new-permission-${permission}`} className="ml-2 block text-sm text-gray-900">
                              {permission.charAt(0).toUpperCase() + permission.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setAddingAdmin(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Admin'}
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

export default AdminsPage;