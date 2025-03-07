import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Security utility functions for Firebase
 */

/**
 * Check if a user has a specific role
 * @param user The Firebase user
 * @param role The role to check
 * @returns Promise resolving to boolean indicating if user has the role
 */
export async function hasRole(user: User | null, role: 'ADMIN' | 'DONOR' | 'VOLUNTEER'): Promise<boolean> {
  if (!user) return false;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return userData.role === role && userData.status === 'ACTIVE';
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if a user is an admin
 * @param user The Firebase user
 * @returns Promise resolving to boolean indicating if user is an admin
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  return hasRole(user, 'ADMIN');
}

/**
 * Check if a user is a donor
 * @param user The Firebase user
 * @returns Promise resolving to boolean indicating if user is a donor
 */
export async function isDonor(user: User | null): Promise<boolean> {
  return hasRole(user, 'DONOR');
}

/**
 * Check if a user is a volunteer
 * @param user The Firebase user
 * @returns Promise resolving to boolean indicating if user is a volunteer
 */
export async function isVolunteer(user: User | null): Promise<boolean> {
  return hasRole(user, 'VOLUNTEER');
}

/**
 * Check if a user is active
 * @param user The Firebase user
 * @returns Promise resolving to boolean indicating if user is active
 */
export async function isActive(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return userData.status === 'ACTIVE';
  } catch (error) {
    console.error('Error checking user status:', error);
    return false;
  }
}

/**
 * Check if a user is the owner of a resource
 * @param user The Firebase user
 * @param resourceId The ID of the resource
 * @param collectionName The collection containing the resource
 * @param ownerField The field containing the owner ID (default: 'user_id')
 * @returns Promise resolving to boolean indicating if user is the owner
 */
export async function isOwner(
  user: User | null, 
  resourceId: string, 
  collectionName: string,
  ownerField: string = 'user_id'
): Promise<boolean> {
  if (!user) return false;
  
  try {
    const resourceDoc = await getDoc(doc(db, collectionName, resourceId));
    if (!resourceDoc.exists()) return false;
    
    const resourceData = resourceDoc.data();
    return resourceData[ownerField] === user.uid;
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
}

/**
 * Check if a user can access a resource
 * @param user The Firebase user
 * @param resourceId The ID of the resource
 * @param collectionName The collection containing the resource
 * @returns Promise resolving to boolean indicating if user can access the resource
 */
export async function canAccess(
  user: User | null, 
  resourceId: string, 
  collectionName: string
): Promise<boolean> {
  // Admins can access any resource
  if (await isAdmin(user)) return true;
  
  // Check if user is the owner
  return isOwner(user, resourceId, collectionName);
}

/**
 * Check if a user can modify a resource
 * @param user The Firebase user
 * @param resourceId The ID of the resource
 * @param collectionName The collection containing the resource
 * @returns Promise resolving to boolean indicating if user can modify the resource
 */
export async function canModify(
  user: User | null, 
  resourceId: string, 
  collectionName: string
): Promise<boolean> {
  // Same as canAccess for now, but can be extended with more specific logic
  return canAccess(user, resourceId, collectionName);
}

export default {
  hasRole,
  isAdmin,
  isDonor,
  isVolunteer,
  isActive,
  isOwner,
  canAccess,
  canModify
}; 