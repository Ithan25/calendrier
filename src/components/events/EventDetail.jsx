import { createPortal } from 'react-dom';
import { useCalendar } from '../../contexts/CalendarContext';
import { useAuth } from '../../contexts/AuthContext';
import { deleteEvent } from '../../services/eventService';
import { formatDateRange } from '../../utils/dateUtils';
import { getInitials } from '../../utils/colorUtils';
import { MapPin, AlignLeft, Trash2, Edit2, X, Clock } from 'lucide-react';
import { useState } from 'react';

export default function EventDetail() {
  const { selectedEvent, closeEventDetail, openEditEvent } = useCalendar();
  const { user, userData, partnerData } = useAuth();
  const [deleting, setDeleting] = useState(false);

  if (!selectedEvent) return null;

  const handleDelete = async () => {
    if (confirm('Supprimer cet événement ?')) {
      setDeleting(true);
      try {
        await deleteEvent(userData.pairId, selectedEvent.id);
        closeEventDetail();
      } catch (err) {
        console.error('Failed to delete event:', err);
      } finally {
        setDeleting(false);
      }
    }
  };

  const isCreator = selectedEvent.createdBy === user?.uid;
  const creatorName = isCreator ? 'Toi' : partnerData?.displayName || 'Partenaire';

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={closeEventDetail} />
      <div className="modal-sheet event-detail">
        <div className="modal-header" style={{ borderBottom: 'none', padding: 0, marginBottom: 'var(--space-4)' }}>
          <button className="btn-icon btn-ghost" onClick={closeEventDetail}>
            <X size={24} />
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-icon btn-ghost" onClick={() => openEditEvent(selectedEvent)}>
              <Edit2 size={20} />
            </button>
            <button className="btn-icon btn-ghost" onClick={handleDelete} disabled={deleting} style={{ color: 'var(--error)' }}>
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="event-detail-header">
          <div className="event-detail-color" style={{ backgroundColor: selectedEvent.color || '#8b5cf6' }} />
          <div>
            <h2>{selectedEvent.title}</h2>
            <div className="event-creator">
              <div
                className="event-creator-avatar"
                style={{
                  backgroundColor: isCreator ? 'var(--primary-500)' : 'var(--accent-500)',
                  width: 20, height: 20, fontSize: 10
                }}
              >
                {isCreator ? getInitials(user?.displayName) : getInitials(partnerData?.displayName)}
              </div>
              <span className="event-creator-name" style={{ fontSize: 'var(--font-xs)' }}>
                Créé par {creatorName}
              </span>
            </div>
          </div>
        </div>

        <div className="event-detail-row">
          <Clock size={20} />
          <div className="event-detail-row-content">
            <div>{formatDateRange(new Date(selectedEvent.startDate), new Date(selectedEvent.endDate), selectedEvent.allDay)}</div>
            {selectedEvent.recurrence && selectedEvent.recurrence !== 'none' && (
              <div className="label" style={{ marginTop: 2 }}>
                Récurrent ({selectedEvent.recurrence})
              </div>
            )}
          </div>
        </div>

        {selectedEvent.location && (
          <div className="event-detail-row">
            <MapPin size={20} />
            <div className="event-detail-row-content">
              <div>{selectedEvent.location}</div>
            </div>
          </div>
        )}

        {selectedEvent.description && (
          <div className="event-detail-row">
            <AlignLeft size={20} />
            <div className="event-detail-row-content">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedEvent.description}</div>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
