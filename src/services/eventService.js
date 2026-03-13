import {
  collection, doc, setDoc, deleteDoc, updateDoc,
  query, where, onSnapshot, orderBy, getDocs, getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { toFirestoreDate } from '../utils/dateUtils';

function eventsCollection(pairId) {
  return collection(db, 'pairs', pairId, 'events');
}

export async function createEvent(pairId, eventData, userId) {
  const docRef = doc(eventsCollection(pairId));
  const event = {
    ...eventData,
    startDate: eventData.startDate instanceof Date ? eventData.startDate.toISOString() : eventData.startDate,
    endDate: eventData.endDate instanceof Date ? eventData.endDate.toISOString() : eventData.endDate,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, event);
  return { id: docRef.id, ...event };
}

export async function updateEvent(pairId, eventId, eventData) {
  const docRef = doc(db, 'pairs', pairId, 'events', eventId);
  const updates = {
    ...eventData,
    startDate: eventData.startDate instanceof Date ? eventData.startDate.toISOString() : eventData.startDate,
    endDate: eventData.endDate instanceof Date ? eventData.endDate.toISOString() : eventData.endDate,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(docRef, updates);
  return { id: eventId, ...updates };
}

export async function deleteEvent(pairId, eventId) {
  const docRef = doc(db, 'pairs', pairId, 'events', eventId);
  await deleteDoc(docRef);
}

export function subscribeToEvents(pairId, callback) {
  if (!pairId) {
    callback([]);
    return () => {};
  }
  const q = query(eventsCollection(pairId), orderBy('startDate', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: new Date(doc.data().startDate),
      endDate: new Date(doc.data().endDate),
    }));
    callback(events);
  }, (error) => {
    console.error('Error subscribing to events:', error);
    callback([]);
  });
}

export async function importEvents(pairId, events, userId) {
  const results = [];
  for (const event of events) {
    const result = await createEvent(pairId, event, userId);
    results.push(result);
  }
  return results;
}
