import { useCalendar } from '../../contexts/CalendarContext';
import { getWeekDays, formatDate, isToday, isSameDay, generateTimeSlots, getEventTopOffset, getEventHeight, formatTime } from '../../utils/dateUtils';
import { WEEKDAYS_SHORT } from '../../utils/constants';
import { hexToRgba } from '../../utils/colorUtils';
import { useEffect, useRef } from 'react';

export default function WeekView() {
  const { selectedDate, setSelectedDate, getEventsForDate, openNewEvent, openEventDetail } = useCalendar();
  const weekDays = getWeekDays(selectedDate);
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
    <div className="week-view" ref={scrollRef}>
      <div className="week-header">
        <div /> {/* empty cell for time column */}
        {weekDays.map((day, i) => (
          <div
            key={i}
            className={`week-header-day${isToday(day) ? ' today' : ''}`}
            onClick={() => setSelectedDate(day)}
          >
            <span className="day-name">{WEEKDAYS_SHORT[i]}</span>
            <span className="day-num">{day.getDate()}</span>
          </div>
        ))}
      </div>

      <div className="week-body">
        <div className="time-column">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="time-slot">
              <span className="time-label">{slot.label}</span>
            </div>
          ))}
        </div>

        {weekDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDate(day).filter(e => !e.allDay);
          return (
            <div key={dayIndex} className="week-day-column">
              {timeSlots.map((slot) => (
                <div
                  key={slot.hour}
                  className="time-slot"
                  onClick={() => {
                    const d = new Date(day);
                    d.setHours(slot.hour, 0, 0, 0);
                    openNewEvent(d);
                  }}
                >
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
                    <div className="event-block-time">{formatTime(new Date(event.startDate))}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {isToday(selectedDate) && <CurrentTimeLine />}
    </div>
  );
}

function CurrentTimeLine() {
  const now = new Date();
  const top = now.getHours() * 60 + now.getMinutes();
  return <div className="current-time-line" style={{ top: `${top + 44}px` }} />;
}
