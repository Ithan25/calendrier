import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCalendar } from '../../contexts/CalendarContext';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent, updateEvent } from '../../services/eventService';
import { CATEGORIES, RECURRENCE_OPTIONS, DEFAULT_EVENT } from '../../utils/constants';
import { format, parseISO } from 'date-fns';
import { MapPin, AlignLeft, Clock, RotateCcw } from 'lucide-react';

export default function EventModal() {
  const { showEventModal, closeEventModal, editingEvent, selectedDate } = useCalendar();
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState(DEFAULT_EVENT);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showEventModal) {
      if (editingEvent) {
        setFormData({
          ...editingEvent,
          startDate: format(new Date(editingEvent.startDate), editingEvent.allDay ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm"),
          endDate: format(new Date(editingEvent.endDate), editingEvent.allDay ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm"),
        });
      } else {
        const start = new Date(selectedDate);
        if (!start.getHours()) start.setHours(9, 0, 0, 0);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);

        setFormData({
          ...DEFAULT_EVENT,
          startDate: format(start, "yyyy-MM-dd'T'HH:mm"),
          endDate: format(end, "yyyy-MM-dd'T'HH:mm"),
        });
      }
    }
  }, [showEventModal, editingEvent, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    if (!userData?.pairId) {
      alert("Vous devez être appairé avec un partenaire (via les Paramètres) pour ajouter un événement.");
      return;
    }

    setLoading(true);
    try {
      const eventPayload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingEvent) {
        await updateEvent(userData.pairId, editingEvent.id, eventPayload);
      } else {
        await createEvent(userData.pairId, eventPayload, user.uid);
      }
      closeEventModal();
    } catch (err) {
      console.error('Error saving event:', err);
      alert("Erreur lors de l'enregistrement de l'événement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleAllDayChange = (e) => {
    const isAllDay = e.target.checked;
    setFormData(prev => {
      const start = new Date(prev.startDate);
      const end = new Date(prev.endDate);

      return {
        ...prev,
        allDay: isAllDay,
        startDate: format(start, isAllDay ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm"),
        endDate: format(end, isAllDay ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm"),
      };
    });
  };

  if (!showEventModal) return null;

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={closeEventModal} />
      <div className="modal-sheet">
        <div className="modal-handle" />

        <form onSubmit={handleSubmit}>
          <div className="modal-header" style={{ borderBottom: 'none' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={closeEventModal}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !formData.title.trim()}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }}/> : 'Enregistrer'}
            </button>
          </div>

          <div className="modal-body">
            <input
              type="text"
              className="event-form-title-input"
              placeholder="Titre de l'événement"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />

            <div className="form-row">
              <Clock className="form-row-icon" size={20} />
              <div className="form-row-content">
                <div className="allday-toggle" style={{ marginBottom: 'var(--space-3)' }}>
                  <span>Toute la journée</span>
                  <label className="toggle">
                    <input type="checkbox" checked={formData.allDay} onChange={handleAllDayChange} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="datetime-inputs">
                  <input
                    type={formData.allDay ? "date" : "datetime-local"}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                  <span>au</span>
                  <input
                    type={formData.allDay ? "date" : "datetime-local"}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    min={formData.startDate}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <MapPin className="form-row-icon" size={20} />
              <div className="form-row-content">
                <input
                  type="text"
                  placeholder="Ajouter un lieu"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ background: 'transparent', border: 'none', padding: 0 }}
                />
              </div>
            </div>

            <div className="form-row">
              <AlignLeft className="form-row-icon" size={20} />
              <div className="form-row-content">
                <textarea
                  placeholder="Ajouter une description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  style={{ background: 'transparent', border: 'none', padding: 0, resize: 'none' }}
                />
              </div>
            </div>

            <div className="form-row" style={{ borderBottom: 'none' }}>
              <div className="color-options" style={{ marginLeft: 32 }}>
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    className={`color-option ${formData.categoryId === cat.id || formData.color === cat.color ? 'selected' : ''}`}
                    style={{ backgroundColor: cat.color }}
                    onClick={() => setFormData({ ...formData, categoryId: cat.id, category: cat.id, color: cat.color })}
                    title={cat.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
}
