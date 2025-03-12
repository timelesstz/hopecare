import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { firestoreUtils } from '../utils/firestoreUtils';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => new Date().toISOString())
}));

vi.mock('../lib/firebase', () => ({
  db: {}
}));

describe('Firestore Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Operations', () => {
    it('should add a document to a collection', async () => {
      // Mock successful document creation
      const mockDocRef = { id: 'new-doc-id' };
      addDoc.mockResolvedValueOnce(mockDocRef);
      collection.mockReturnValueOnce('donations-collection');

      const donationData = {
        amount: 100,
        currency: 'USD',
        donor_id: 'donor-123',
        created_at: new Date().toISOString()
      };

      const result = await firestoreUtils.addDocument('donations', donationData);

      expect(collection).toHaveBeenCalledWith(db, 'donations');
      expect(addDoc).toHaveBeenCalledWith('donations-collection', donationData);
      expect(result).toEqual({ id: 'new-doc-id', ...donationData });
    });

    it('should handle errors when adding a document', async () => {
      // Mock error during document creation
      const mockError = new Error('Failed to add document');
      addDoc.mockRejectedValueOnce(mockError);
      collection.mockReturnValueOnce('donations-collection');

      const donationData = {
        amount: 100,
        currency: 'USD',
        donor_id: 'donor-123'
      };

      await expect(firestoreUtils.addDocument('donations', donationData))
        .rejects.toThrow('Failed to add document');

      expect(collection).toHaveBeenCalledWith(db, 'donations');
      expect(addDoc).toHaveBeenCalledWith('donations-collection', donationData);
    });
  });

  describe('Read Operations', () => {
    it('should get a document by ID', async () => {
      // Mock successful document retrieval
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          amount: 100,
          currency: 'USD',
          donor_id: 'donor-123'
        }),
        id: 'doc-123'
      };
      
      getDoc.mockResolvedValueOnce(mockDocSnap);
      doc.mockReturnValueOnce('document-ref');

      const result = await firestoreUtils.getDocument('donations', 'doc-123');

      expect(doc).toHaveBeenCalledWith(db, 'donations', 'doc-123');
      expect(getDoc).toHaveBeenCalledWith('document-ref');
      expect(result).toEqual({
        id: 'doc-123',
        amount: 100,
        currency: 'USD',
        donor_id: 'donor-123'
      });
    });

    it('should return null for non-existent document', async () => {
      // Mock non-existent document
      const mockDocSnap = {
        exists: () => false
      };
      
      getDoc.mockResolvedValueOnce(mockDocSnap);
      doc.mockReturnValueOnce('document-ref');

      const result = await firestoreUtils.getDocument('donations', 'non-existent-id');

      expect(doc).toHaveBeenCalledWith(db, 'donations', 'non-existent-id');
      expect(getDoc).toHaveBeenCalledWith('document-ref');
      expect(result).toBeNull();
    });

    it('should query documents with filters', async () => {
      // Mock successful query
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'doc-1',
            data: () => ({
              amount: 100,
              currency: 'USD',
              donor_id: 'donor-123'
            })
          },
          {
            id: 'doc-2',
            data: () => ({
              amount: 200,
              currency: 'USD',
              donor_id: 'donor-123'
            })
          }
        ]
      };
      
      getDocs.mockResolvedValueOnce(mockQuerySnapshot);
      collection.mockReturnValueOnce('donations-collection');
      query.mockReturnValueOnce('filtered-query');
      where.mockReturnValueOnce('where-clause');
      orderBy.mockReturnValueOnce('order-clause');
      limit.mockReturnValueOnce('limit-clause');

      const result = await firestoreUtils.queryDocuments('donations', {
        filters: [{ field: 'donor_id', operator: '==', value: 'donor-123' }],
        orderByField: 'amount',
        orderByDirection: 'desc',
        limitTo: 10
      });

      expect(collection).toHaveBeenCalledWith(db, 'donations');
      expect(where).toHaveBeenCalledWith('donor_id', '==', 'donor-123');
      expect(orderBy).toHaveBeenCalledWith('amount', 'desc');
      expect(limit).toHaveBeenCalledWith(10);
      expect(query).toHaveBeenCalledWith(
        'donations-collection', 
        'where-clause', 
        'order-clause', 
        'limit-clause'
      );
      expect(getDocs).toHaveBeenCalledWith('filtered-query');
      
      expect(result).toEqual([
        {
          id: 'doc-1',
          amount: 100,
          currency: 'USD',
          donor_id: 'donor-123'
        },
        {
          id: 'doc-2',
          amount: 200,
          currency: 'USD',
          donor_id: 'donor-123'
        }
      ]);
    });
  });

  describe('Update Operations', () => {
    it('should update a document', async () => {
      // Mock successful document update
      updateDoc.mockResolvedValueOnce({});
      doc.mockReturnValueOnce('document-ref');

      const updateData = {
        amount: 150,
        updated_at: new Date().toISOString()
      };

      await firestoreUtils.updateDocument('donations', 'doc-123', updateData);

      expect(doc).toHaveBeenCalledWith(db, 'donations', 'doc-123');
      expect(updateDoc).toHaveBeenCalledWith('document-ref', updateData);
    });

    it('should handle errors when updating a document', async () => {
      // Mock error during document update
      const mockError = new Error('Failed to update document');
      updateDoc.mockRejectedValueOnce(mockError);
      doc.mockReturnValueOnce('document-ref');

      const updateData = {
        amount: 150
      };

      await expect(firestoreUtils.updateDocument('donations', 'doc-123', updateData))
        .rejects.toThrow('Failed to update document');

      expect(doc).toHaveBeenCalledWith(db, 'donations', 'doc-123');
      expect(updateDoc).toHaveBeenCalledWith('document-ref', updateData);
    });
  });

  describe('Delete Operations', () => {
    it('should delete a document', async () => {
      // Mock successful document deletion
      deleteDoc.mockResolvedValueOnce({});
      doc.mockReturnValueOnce('document-ref');

      await firestoreUtils.deleteDocument('donations', 'doc-123');

      expect(doc).toHaveBeenCalledWith(db, 'donations', 'doc-123');
      expect(deleteDoc).toHaveBeenCalledWith('document-ref');
    });

    it('should handle errors when deleting a document', async () => {
      // Mock error during document deletion
      const mockError = new Error('Failed to delete document');
      deleteDoc.mockRejectedValueOnce(mockError);
      doc.mockReturnValueOnce('document-ref');

      await expect(firestoreUtils.deleteDocument('donations', 'doc-123'))
        .rejects.toThrow('Failed to delete document');

      expect(doc).toHaveBeenCalledWith(db, 'donations', 'doc-123');
      expect(deleteDoc).toHaveBeenCalledWith('document-ref');
    });
  });
}); 