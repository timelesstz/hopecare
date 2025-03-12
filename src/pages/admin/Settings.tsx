import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp, query, where, addDoc, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { Save, Settings as SettingsIcon, AlertCircle, Check, Mail, Globe, DollarSign, Users, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFirestoreOperation, isMissingCollectionError } from '../../utils/firestoreRetry';
import { logFirestoreError } from '../../utils/firestoreErrorHandler';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  enableDonations: boolean;
  enableVolunteers: boolean;
  enableEvents: boolean;
  enableBlog: boolean;
  enableNotifications: boolean;
  currencySymbol: string;
  defaultLanguage: string;
  termsUrl: string;
  privacyUrl: string;
  lastUpdated: any;
  updatedBy: string;
}

const defaultSettings: SystemSettings = {
  siteName: 'HopeCare',
  siteDescription: 'Empowering communities through hope and care',
  contactEmail: 'contact@hopecaretz.org',
  supportEmail: 'support@hopecaretz.org',
  logoUrl: '/logo.png',
  primaryColor: '#e11d48',
  secondaryColor: '#0f172a',
  enableDonations: true,
  enableVolunteers: true,
  enableEvents: true,
  enableBlog: true,
  enableNotifications: true,
  currencySymbol: '$',
  defaultLanguage: 'en',
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  lastUpdated: null,
  updatedBy: ''
};

const SettingsPage: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [collectionExists, setCollectionExists] = useState<boolean>(true);
  const [creatingCollection, setCreatingCollection] = useState<boolean>(false);

  // Check if settings collection exists
  const checkSettingsCollectionExists = async (): Promise<boolean> => {
    try {
      const settingsRef = collection(db, 'settings');
      const snapshot = await getDocs(query(settingsRef, limit(1)));
      return true;
    } catch (error) {
      console.error('Error checking settings collection:', error);
      return false;
    }
  };
  
  // Create settings collection
  const createSettingsCollection = async () => {
    try {
      setCreatingCollection(true);
      
      const settingsRef = collection(db, 'settings');
      const systemSettings = {
        siteName: 'HopeCare',
        siteDescription: 'Empowering communities through hope and care',
        contactEmail: 'contact@hopecare.org',
        supportEmail: 'support@hopecare.org',
        logoUrl: '/logo.png',
        primaryColor: '#e11d48',
        secondaryColor: '#4f46e5',
        enableDonations: true,
        enableVolunteers: true,
        enableEvents: true,
        enableBlog: true,
        enableNotifications: true,
        currencySymbol: '$',
        defaultLanguage: 'en',
        termsUrl: '/terms',
        privacyUrl: '/privacy',
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.email || 'system',
        created_at: new Date().toISOString()
      };
      
      const docRef = await addDoc(settingsRef, systemSettings);
      
      // Add the document ID to the settings object for state update
      const settingsWithId = {
        ...systemSettings,
        id: docRef.id
      };
      
      toast.success('Settings collection created successfully!');
      setCollectionExists(true);
      setSettings(settingsWithId);
    } catch (error) {
      console.error('Error creating settings collection:', error);
      toast.error('Failed to create settings collection');
    } finally {
      setCreatingCollection(false);
    }
  };

  useEffect(() => {
    // Check if user has admin permissions
    if (user && user.role === 'ADMIN') {
      const checkCollection = async () => {
        const exists = await checkSettingsCollectionExists();
        setCollectionExists(exists);
        if (exists) {
          fetchSettings();
        } else {
          setError('Settings collection does not exist. Create it to manage settings.');
        }
      };
      
      checkCollection();
    } else {
      setError('You do not have permission to access this page');
      toast.error('Access denied. Admin permissions required.');
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await safeFirestoreOperation(
        async () => {
          // Get all documents from the settings collection
          const settingsQuery = query(collection(db, 'settings'), limit(1));
          const settingsSnapshot = await getDocs(settingsQuery);
          
          if (settingsSnapshot.empty) {
            // No settings found, return default settings
            return { 
              empty: true, 
              defaultSettings: {
                siteName: 'HopeCare',
                siteDescription: 'Empowering communities through hope and care',
                contactEmail: 'contact@hopecare.org',
                supportEmail: 'support@hopecare.org',
                logoUrl: '/logo.png',
                primaryColor: '#e11d48',
                secondaryColor: '#4f46e5',
                enableDonations: true,
                enableVolunteers: true,
                enableEvents: true,
                enableBlog: true,
                enableNotifications: true,
                currencySymbol: '$',
                defaultLanguage: 'en',
                termsUrl: '/terms',
                privacyUrl: '/privacy',
                lastUpdated: new Date().toISOString(),
                updatedBy: user?.email || 'system'
              }
            };
          }
          
          // Settings found, return the data with the document ID
          const doc = settingsSnapshot.docs[0];
          return { 
            empty: false, 
            data: {
              id: doc.id,
              ...doc.data()
            } as SystemSettings 
          };
        },
        'Failed to load settings. Please try again later.',
        'settings-fetch'
      );
      
      if (!result) {
        // The operation failed and error was already handled by safeFirestoreOperation
        setError('Failed to load settings');
        return;
      }
      
      if (result.empty) {
        // No settings found, use default settings
        setSettings(result.defaultSettings);
      } else {
        // Settings found, use the data
        setSettings(result.data);
      }
    } catch (err) {
      // This catch is for any errors not caught by safeFirestoreOperation
      logFirestoreError(err, 'settings-fetch-outer');
      setError('An unexpected error occurred while loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const result = await safeFirestoreOperation(
        async () => {
          const updatedSettings = {
            ...settings,
            lastUpdated: new Date().toISOString(),
            updatedBy: user?.email || 'system'
          };
          
          // Remove the id field from the data to be saved
          const { id, ...settingsData } = updatedSettings;
          
          if (!id) {
            // Create new settings document
            const docRef = await addDoc(collection(db, 'settings'), {
              ...settingsData,
              created_at: new Date().toISOString()
            });
            return { id: docRef.id, isNew: true };
          } else {
            // Update existing settings document
            await updateDoc(doc(db, 'settings', id), settingsData);
            return { id, isNew: false };
          }
        },
        'Failed to save settings. Please try again.',
        'settings-save'
      );
      
      if (result) {
        toast.success(result.isNew ? 'Settings created successfully!' : 'Settings updated successfully!');
        fetchSettings();
      }
    } catch (err) {
      logFirestoreError(err, 'settings-save-outer');
      setError('An unexpected error occurred while saving settings');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleChange = (name: string) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name as keyof SystemSettings] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <button
          onClick={handleSaveSettings}
          disabled={saving || !collectionExists}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <LoadingSpinner size="small" color="white" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {!collectionExists ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <p className="font-medium">Settings collection does not exist</p>
          </div>
          <p className="text-sm mt-2 mb-3">
            The settings collection does not exist in your database. You need to create it to manage system settings.
          </p>
          <div className="flex justify-end">
            <button
              onClick={createSettingsCollection}
              disabled={creatingCollection}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingCollection ? 'Creating...' : 'Create Settings Collection'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
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
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  General
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'appearance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('appearance')}
                >
                  Appearance
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'features' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('features')}
                >
                  Features
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'advanced' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('advanced')}
                >
                  Advanced
                </button>
              </div>
              
              <div className="mt-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                      <input
                        type="text"
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                      <textarea
                        name="siteDescription"
                        value={settings.siteDescription}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={settings.contactEmail}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                      <input
                        type="email"
                        name="supportEmail"
                        value={settings.supportEmail}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
                
                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                      <input
                        type="text"
                        name="logoUrl"
                        value={settings.logoUrl}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          name="primaryColor"
                          value={settings.primaryColor}
                          onChange={handleChange}
                          className="h-10 w-10 border border-gray-300 rounded-md mr-2"
                        />
                        <input
                          type="text"
                          name="primaryColor"
                          value={settings.primaryColor}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          name="secondaryColor"
                          value={settings.secondaryColor}
                          onChange={handleChange}
                          className="h-10 w-10 border border-gray-300 rounded-md mr-2"
                        />
                        <input
                          type="text"
                          name="secondaryColor"
                          value={settings.secondaryColor}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Features Settings */}
                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableDonations"
                        checked={settings.enableDonations}
                        onChange={() => handleToggleChange('enableDonations')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableDonations" className="ml-2 block text-sm text-gray-900">
                        Enable Donations
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableVolunteers"
                        checked={settings.enableVolunteers}
                        onChange={() => handleToggleChange('enableVolunteers')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableVolunteers" className="ml-2 block text-sm text-gray-900">
                        Enable Volunteers
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableEvents"
                        checked={settings.enableEvents}
                        onChange={() => handleToggleChange('enableEvents')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableEvents" className="ml-2 block text-sm text-gray-900">
                        Enable Events
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableBlog"
                        checked={settings.enableBlog}
                        onChange={() => handleToggleChange('enableBlog')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableBlog" className="ml-2 block text-sm text-gray-900">
                        Enable Blog
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableNotifications"
                        checked={settings.enableNotifications}
                        onChange={() => handleToggleChange('enableNotifications')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
                        Enable Notifications
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Advanced Settings */}
                {activeTab === 'advanced' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        name="currencySymbol"
                        value={settings.currencySymbol}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                      <select
                        name="defaultLanguage"
                        value={settings.defaultLanguage}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Terms URL</label>
                      <input
                        type="text"
                        name="termsUrl"
                        value={settings.termsUrl}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Privacy URL</label>
                      <input
                        type="text"
                        name="privacyUrl"
                        value={settings.privacyUrl}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated: {settings.lastUpdated ? new Date(settings.lastUpdated.seconds * 1000).toLocaleString() : 'Never'} 
                  {settings.updatedBy && ` by ${settings.updatedBy}`}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SettingsPage; 