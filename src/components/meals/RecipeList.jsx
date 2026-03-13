import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/Toast';
import { getRecipesQuery, createRecipe, deleteRecipe, addRecipeToGroceriesSimple } from '../../services/mealService';
import { onSnapshot } from 'firebase/firestore';
import { Plus, X, Trash2, ShoppingCart } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function RecipeList() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userData?.pairId) return;

    const q = getRecipesQuery(userData.pairId);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching recipes:', error);
      toast.error('Erreur lors du chargement des recettes.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.pairId, toast]);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredientRow = (index) => {
    if (ingredients.length === 1) return;
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !userData?.pairId) return;

    setSaving(true);
    try {
      const validIngredients = ingredients.filter(i => i.name.trim() !== '');
      await createRecipe(userData.pairId, {
        title: title.trim(),
        instructions: instructions.trim(),
        ingredients: validIngredients
      }, user.uid);
      
      toast.success('Recette ajoutée !');
      setShowForm(false);
      setTitle('');
      setInstructions('');
      setIngredients([{ name: '', amount: '', unit: '' }]);
    } catch (err) {
      toast.error('Erreur lors de l\'ajout.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToGroceries = async (recipe) => {
    if (!userData?.pairId) return;
    try {
      await addRecipeToGroceriesSimple(userData.pairId, recipe, user.uid);
      toast.success('Ingrédients ajoutés à la liste de courses !');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout aux courses.');
    }
  };

  const handleDelete = async (recipeId) => {
    if (confirm('Supprimer cette recette ?')) {
      try {
        await deleteRecipe(userData.pairId, recipeId);
        toast.info('Recette supprimée.');
      } catch (err) {
        toast.error('Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
      <button 
        className="btn btn-primary btn-full" 
        onClick={() => setShowForm(true)}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <Plus size={18} /> Ajouter une recette
      </button>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}><span className="spinner" /></div>
      ) : recipes.length === 0 ? (
        <div className="agenda-empty">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍳</div>
          <div>Aucune recette pour le moment</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {recipes.map(recipe => (
            <div key={recipe.id} className="settings-card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>{recipe.title}</h3>
                <button className="btn-icon btn-ghost" onClick={() => handleDelete(recipe.id)} style={{ color: 'var(--text-tertiary)', width: 28, height: 28 }}>
                  <Trash2 size={16} />
                </button>
              </div>
              
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div style={{ marginBottom: 'var(--space-3)', background: 'var(--bg-tertiary)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)', fontWeight: 600 }}>Ingrédients:</div>
                  <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing.amount} {ing.unit} {ing.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                className="btn btn-secondary btn-full btn-sm"
                onClick={() => handleAddToGroceries(recipe)}
              >
                <ShoppingCart size={16} /> Ajouter aux courses
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && createPortal(
        <>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
          <div className="modal-sheet">
            <div className="modal-handle" />
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3>Nouvelle Recette</h3>
                <button type="button" className="btn-icon btn-ghost" onClick={() => setShowForm(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Titre de la recette</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Ex: Pâtes à la Carbonara"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Ingrédients</label>
                  {ingredients.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <input 
                        type="text" 
                        placeholder="Nom (Ex: Pâtes)" 
                        value={ing.name} 
                        onChange={e => handleIngredientChange(i, 'name', e.target.value)}
                        style={{ flex: 2 }}
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="Qté" 
                        value={ing.amount} 
                        onChange={e => handleIngredientChange(i, 'amount', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <select
                        value={ing.unit} 
                        onChange={e => handleIngredientChange(i, 'unit', e.target.value)}
                        style={{ flex: 1, padding: 'var(--space-2)' }}
                      >
                        <option value="">Unité...</option>
                        <option value="g">gramme(s)</option>
                        <option value="kg">kilo(s)</option>
                        <option value="ml">ml</option>
                        <option value="L">litre(s)</option>
                        <option value="c.à.c">c.à.c</option>
                        <option value="c.à.s">c.à.s</option>
                        <option value="pièce(s)">pièce(s)</option>
                        <option value="tranche(s)">tranche(s)</option>
                        <option value="pincée(s)">pincée(s)</option>
                      </select>
                      {ingredients.length > 1 && (
                        <button type="button" className="btn-icon btn-ghost" onClick={() => removeIngredientRow(i)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addIngredientRow} style={{ alignSelf: 'flex-start' }}>
                    + Ajouter un ingrédient
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !title.trim()} style={{ flex: 1 }}>
                  {saving ? <span className="spinner" style={{ width: 16, height: 16 }}/> : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
