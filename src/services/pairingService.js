import {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, updateDoc, deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { generateInviteCode } from '../utils/colorUtils';

export async function createPair(userId) {
  const code = generateInviteCode();
  const pairRef = doc(collection(db, 'pairs'));

  await setDoc(pairRef, {
    user1Id: userId,
    user2Id: null,
    inviteCode: code,
    createdAt: new Date().toISOString(),
  });

  // Update user's pairId (using setDoc with merge to avoid 'No document to update' if doc is missing)
  await setDoc(doc(db, 'users', userId), { pairId: pairRef.id }, { merge: true });

  // Create default categories
  const defaultCategories = [
    { name: 'Couple', color: '#ec4899', icon: '💕' },
    { name: 'Travail', color: '#3b82f6', icon: '💼' },
    { name: 'Personnel', color: '#8b5cf6', icon: '👤' },
    { name: 'Sport', color: '#22c55e', icon: '🏃' },
  ];

  for (const cat of defaultCategories) {
    const catRef = doc(collection(db, 'pairs', pairRef.id, 'categories'));
    await setDoc(catRef, cat);
  }

  return { id: pairRef.id, inviteCode: code };
}

export async function joinPair(userId, inviteCode) {
  const pairsRef = collection(db, 'pairs');
  const q = query(pairsRef, where('inviteCode', '==', inviteCode.toUpperCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Code invalide. Vérifie le code et réessaie.');
  }

  const pairDoc = snapshot.docs[0];
  const pairData = pairDoc.data();

  if (pairData.user2Id) {
    throw new Error('Ce code a déjà été utilisé.');
  }

  if (pairData.user1Id === userId) {
    throw new Error('Tu ne peux pas utiliser ton propre code !');
  }

  // Link user2
  await updateDoc(doc(db, 'pairs', pairDoc.id), {
    user2Id: userId,
    linkedAt: new Date().toISOString(),
  });

  // Update user's pairId (using setDoc with merge to avoid 'No document to update' if doc is missing)
  await setDoc(doc(db, 'users', userId), { pairId: pairDoc.id }, { merge: true });

  return { id: pairDoc.id };
}

export async function getPairData(pairId) {
  const docRef = doc(db, 'pairs', pairId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getPartnerData(pairData, currentUserId) {
  if (!pairData) return null;
  const partnerId = pairData.user1Id === currentUserId ? pairData.user2Id : pairData.user1Id;
  if (!partnerId) return null;

  const userDoc = await getDoc(doc(db, 'users', partnerId));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
}

export async function unpair(pairId, userId) {
  // Remove user2 from pair
  const pairRef = doc(db, 'pairs', pairId);
  await deleteDoc(pairRef);
  await setDoc(doc(db, 'users', userId), { pairId: null }, { merge: true });
}
