import { useMemo } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatTime, isToday, isSameDay, addDays } from '../../utils/dateUtils';
import { getInitials } from '../../utils/colorUtils';
import { MapPin, CalendarDays } from 'lucide-react';

export default function AgendaView() {
  const { events, openEventDetail } = useCalendar();
  const { user, partnerData } = useAuth();

  const groupedEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = events
      .filter(e => new Date(e.endDate) >= now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const groups = {};
    for (const event of upcoming) {
      const dateKey = new Date(event.startDate).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: new Date(event.startDate),
          events: [],
        };
      }
      groups[dateKey].events.push(event);
    }

    return Object.values(groups).slice(0, 30);
  }, [events]);

  if (groupedEvents.length === 0) {
    return (
      <div className="agenda-view">
        <div className="agenda-empty">
          <div className="agenda-empty-icon">📅</div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Aucun événement à venir</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
            Appuie sur + pour ajouter un événement
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="agenda-view">
      {groupedEvents.map((group, i) => {
        const today = isToday(group.date);
        return (
          <div key={i} className="agenda-day-group" style={{ animationDelay: `${i * 50}ms`, animation: 'fadeInUp 0.3s ease forwards' }}>
            <div className={`agenda-date-header${today ? ' today' : ''}`}>
              <span className="date-day">{group.date.getDate()}</span>
              <span className="date-info">
                {formatDate(group.date, 'EEEE')}{today ? ' · Aujourd\'hui' : ` · ${formatDate(group.date, 'MMMM yyyy')}`}
              </span>
            </div>
            {group.events.map((event) => (
              <div
                key={event.id}
                className="agenda-event"
                style={{ borderLeftColor: event.color || '#8b5cf6' }}
                onClick={() => openEventDetail(event)}
              >
                <div className="agenda-event-time">
                  {event.allDay ? 'Journée' : formatTime(new Date(event.startDate))}
                </div>
                <div className="agenda-event-content">
                  <div className="agenda-event-title">{event.title}</div>
                  {event.location && (
                    <div className="agenda-event-location">
                      <MapPin size={12} /> {event.location}
                    </div>
                  )}
                  <div className="event-creator">
                    <div
                      className="event-creator-avatar"
                      style={{
                        backgroundColor: event.createdBy === user?.uid ? 'var(--primary-500)' : 'var(--accent-500)'
                      }}
                    >
                      {event.createdBy === user?.uid
                        ? getInitials(user?.displayName)
                        : getInitials(partnerData?.displayName)}
                    </div>
                    <span className="event-creator-name">
                      {event.createdBy === user?.uid ? 'Toi' : partnerData?.displayName || 'Partenaire'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
