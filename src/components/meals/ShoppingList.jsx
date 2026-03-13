import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/Toast';
import { getGroceriesQuery, createGroceryItem, deleteGroceryItem, toggleGroceryItem } from '../../services/mealService';
import { onSnapshot } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function ShoppingList() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userData?.pairId) return;

    const q = getGroceriesQuery(userData.pairId);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching groceries:', error);
      toast.error('Erreur lors du chargement des courses.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.pairId, toast]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !userData?.pairId) return;

    setSaving(true);
    try {
      await createGroceryItem(userData.pairId, {
        name: newItemName.trim(),
        amount: parseFloat(newItemAmount) || 0,
        unit: newItemUnit || ''
      }, user.uid);
      setNewItemName('');
      setNewItemAmount('');
      setNewItemUnit('');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleGroceryItem(userData.pairId, item.id, !item.completed);
    } catch (err) {
      toast.error('Erreur lors de la modification.');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteGroceryItem(userData.pairId, itemId);
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const activeItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed);

  return (
    <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
      <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input 
            type="text"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            placeholder="Article (ex: Lait, Pain...)"
            style={{ flex: 2 }}
            required
          />
          <button type="submit" className="btn btn-primary btn-icon" disabled={saving || !newItemName.trim()} style={{ flexShrink: 0 }}>
            {saving ? <span className="spinner" style={{ width: 16, height: 16 }}/> : <Plus size={20} />}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input 
            type="number"
            value={newItemAmount}
            onChange={e => setNewItemAmount(e.target.value)}
            placeholder="Qté"
            style={{ flex: 1 }}
          />
          <select
            value={newItemUnit}
            onChange={e => setNewItemUnit(e.target.value)}
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
        </div>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}><span className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="agenda-empty">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <div>La liste de courses est vide</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Active Items */}
          {activeItems.length > 0 && (
            <div>
              <h4 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 'var(--space-3)' }}>À acheter</h4>
              <div className="settings-card">
                {activeItems.map(item => (
                  <div key={item.id} className="settings-item" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div onClick={() => handleToggle(item)} style={{ cursor: 'pointer', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      <Circle size={22} />
                    </div>
                    <div className="settings-item-content" onClick={() => handleToggle(item)} style={{ cursor: 'pointer' }}>
                      <div className="settings-item-title">{item.name}</div>
                      {(item.amount > 0 || item.unit) && (
                        <div className="settings-item-desc">{item.amount} {item.unit}</div>
                      )}
                    </div>
                    <button className="settings-item-action btn-icon btn-ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <h4 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 'var(--space-3)' }}>Achetés</h4>
              <div className="settings-card" style={{ opacity: 0.6 }}>
                {completedItems.map(item => (
                  <div key={item.id} className="settings-item" style={{ padding: 'var(--space-2) var(--space-4)' }}>
                    <div onClick={() => handleToggle(item)} style={{ cursor: 'pointer', color: 'var(--success)', marginTop: 2 }}>
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="settings-item-content" onClick={() => handleToggle(item)} style={{ cursor: 'pointer', textDecoration: 'line-through' }}>
                      <div className="settings-item-title" style={{ color: 'var(--text-secondary)' }}>{item.name}</div>
                    </div>
                    <button className="settings-item-action btn-icon btn-ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
