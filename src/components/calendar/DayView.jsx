import { useCalendar } from '../../contexts/CalendarContext';
import { formatDate, generateTimeSlots, getEventTopOffset, getEventHeight, formatTime, isToday } from '../../utils/dateUtils';
import { hexToRgba } from '../../utils/colorUtils';
import { useEffect, useRef } from 'react';

export default function DayView() {
  const { selectedDate, getEventsForDate, openNewEvent, openEventDetail } = useCalendar();
  const dayEvents = getEventsForDate(selectedDate).filter(e => !e.allDay);
  const allDayEvents = getEventsForDate(selectedDate).filter(e => e.allDay);
  const timeSlots = generateTimeSlots(0, 24);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const scrollTo = (now.getHours() - 2) * 60;
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, []);

  return (
    <div className="day-view" ref={scrollRef}>
      {allDayEvents.length > 0 && (
        <div style={{ padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--border-secondary)' }}>
          {allDayEvents.map((event, i) => (
            <div
              key={i}
              className="agenda-event"
              style={{ borderLeftColor: event.color || '#8b5cf6' }}
              onClick={() => openEventDetail(event)}
            >
              <div className="agenda-event-content">
                <div className="agenda-event-title">{event.title}</div>
                <div className="agenda-event-time">Toute la journée</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="time-grid">
        {timeSlots.map((slot) => (
          <div
            key={slot.hour}
            className="time-slot"
            onClick={() => {
              const d = new Date(selectedDate);
              d.setHours(slot.hour, 0, 0, 0);
              openNewEvent(d);
            }}
          >
            <span className="time-label">{slot.label}</span>
            <div className="time-slot-content" />
          </div>
        ))}

        {dayEvents.map((event, j) => {
          const top = getEventTopOffset(new Date(event.startDate));
          const height = getEventHeight(new Date(event.startDate), new Date(event.endDate));
          return (
            <div
              key={j}
              className="event-block"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                left: '56px',
                right: '8px',
                backgroundColor: hexToRgba(event.color || '#8b5cf6', 0.2),
                borderLeftColor: event.color || '#8b5cf6',
                color: event.color || '#8b5cf6',
              }}
              onClick={(e) => {
                e.stopPropagation();
                openEventDetail(event);
              }}
            >
              <div className="event-block-title">{event.title}</div>
              <div className="event-block-time">
                {formatTime(new Date(event.startDate))} — {formatTime(new Date(event.endDate))}
              </div>
            </div>
          );
        })}

        {isToday(selectedDate) && <CurrentTimeLine />}
      </div>
    </div>
  );
}

function CurrentTimeLine() {
  const now = new Date();
  const top = now.getHours() * 60 + now.getMinutes();
  return <div className="current-time-line" style={{ top: `${top}px` }} />;
}
