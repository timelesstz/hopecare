import { vi } from 'vitest';

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn((callback) => {
    callback(null);
    return vi.fn(); // Unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
};

// Mock Firestore
export const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    add: vi.fn(),
    where: vi.fn(() => ({
      get: vi.fn(),
    })),
    orderBy: vi.fn(() => ({
      get: vi.fn(),
      limit: vi.fn(() => ({
        get: vi.fn(),
      })),
    })),
  })),
  doc: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
};

// Mock Firebase Storage
export const mockStorage = {
  ref: vi.fn(() => ({
    put: vi.fn(),
    delete: vi.fn(),
    getDownloadURL: vi.fn(),
    listAll: vi.fn(),
  })),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
  listAll: vi.fn(),
};

// Mock Firebase
export const mockFirebase = {
  auth: mockAuth,
  db: mockFirestore,
  storage: mockStorage,
}; 