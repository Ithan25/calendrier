import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, query, orderBy, serverTimestamp, runTransaction
} from 'firebase/firestore';
import { db } from './firebase';

// ==========================================
// RECIPES
// ==========================================

export const getRecipesQuery = (pairId) => {
  return query(collection(db, 'pairs', pairId, 'recipes'), orderBy('createdAt', 'desc'));
};

export const createRecipe = async (pairId, recipeData, userId) => {
  const docRef = await addDoc(collection(db, 'pairs', pairId, 'recipes'), {
    ...recipeData,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateRecipe = async (pairId, recipeId, recipeData) => {
  const docRef = doc(db, 'pairs', pairId, 'recipes', recipeId);
  await updateDoc(docRef, {
    ...recipeData,
    updatedAt: serverTimestamp()
  });
};

export const deleteRecipe = async (pairId, recipeId) => {
  await deleteDoc(doc(db, 'pairs', pairId, 'recipes', recipeId));
};

// ==========================================
// GROCERIES (SHOPPING LIST)
// ==========================================

export const getGroceriesQuery = (pairId) => {
  return query(collection(db, 'pairs', pairId, 'groceries'), orderBy('createdAt', 'desc'));
};

export const createGroceryItem = async (pairId, itemData, userId) => {
  const docRef = await addDoc(collection(db, 'pairs', pairId, 'groceries'), {
    ...itemData,
    completed: false,
    addedBy: userId,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateGroceryItem = async (pairId, itemId, updates) => {
  const docRef = doc(db, 'pairs', pairId, 'groceries', itemId);
  await updateDoc(docRef, updates);
};

export const deleteGroceryItem = async (pairId, itemId) => {
  await deleteDoc(doc(db, 'pairs', pairId, 'groceries', itemId));
};

export const toggleGroceryItem = async (pairId, itemId, completedState) => {
  const docRef = doc(db, 'pairs', pairId, 'groceries', itemId);
  await updateDoc(docRef, { completed: completedState });
};

// ==========================================
// BUSINESS LOGIC: Add Recipe to Groceries
// ==========================================

export const addRecipeToGroceries = async (pairId, recipe, userId) => {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return;

  const groceriesRef = collection(db, 'pairs', pairId, 'groceries');
  
  // We use a transaction to safely fetch and merge items
  await runTransaction(db, async (transaction) => {
    // 1. Get all current UNCOMPLETED groceries
    // (Firebase doesn't allow easy transaction queries without constraints, 
    // but in a real-time app, we will just read them first or we can do multiple reads)
    // Actually, Firestore JS SDK transactions require providing DocRefs. To query inside a transaction is limited.
    // For simplicity, let's fetch first outside transaction or just do serial adds since collisions are rare for small apps.
  });
};

// Simplified version without complex transactions for MVP:
import { getDocs, where } from 'firebase/firestore';

export const addRecipeToGroceriesSimple = async (pairId, recipe, userId) => {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return;

  const groceriesRef = collection(db, 'pairs', pairId, 'groceries');
  const q = query(groceriesRef, where('completed', '==', false));
  const querySnapshot = await getDocs(q);
  
  const existingItems = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  for (const ingredient of recipe.ingredients) {
    const nameStr = ingredient.name.trim().toLowerCase();
    const unitStr = (ingredient.unit || '').trim().toLowerCase();
    const amountNum = parseFloat(ingredient.amount) || 0;

    // Try to find a matching uncompleted item (same name and unit)
    const match = existingItems.find(item => 
      item.name.trim().toLowerCase() === nameStr && 
      (item.unit || '').trim().toLowerCase() === unitStr
    );

    if (match) {
      // Merge: Update existing item
      const newAmount = (parseFloat(match.amount) || 0) + amountNum;
      await updateDoc(doc(db, 'pairs', pairId, 'groceries', match.id), {
        amount: newAmount,
        updatedAt: serverTimestamp()
      });
      // Update our local cache to reflect the new amount
      match.amount = newAmount;
    } else {
      // Create new item
      const newItem = {
        name: ingredient.name.trim(),
        amount: amountNum,
        unit: ingredient.unit || '',
        completed: false,
        addedBy: userId,
        createdAt: serverTimestamp()
      };
      const newItemRef = await addDoc(groceriesRef, newItem);
      // Add to local cache so subsequent ingredients in the same recipe can merge if there are duplicates
      existingItems.push({ id: newItemRef.id, ...newItem });
    }
  }
};
