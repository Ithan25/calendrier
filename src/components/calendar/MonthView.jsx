import { useCalendar } from '../../contexts/CalendarContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, isSameMonth, isSameDay, isToday, getMonthDays } from '../../utils/dateUtils';
import { WEEKDAYS_SHORT } from '../../utils/constants';
import { hexToRgba } from '../../utils/colorUtils';

export default function MonthView() {
  const { selectedDate, setSelectedDate, getEventsForDate, openNewEvent, openEventDetail } = useCalendar();
  const { user } = useAuth();
  const days = getMonthDays(selectedDate);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleDayDoubleClick = (day) => {
    openNewEvent(day);
  };

  return (
    <div className="month-grid">
      <div className="weekday-row">
        {WEEKDAYS_SHORT.map((day) => (
          <div key={day} className="weekday-cell">{day}</div>
        ))}
      </div>
      <div className="days-grid">
        {days.map((day, i) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={i}
              className={`day-cell${!isCurrentMonth ? ' other-month' : ''}${isTodayDate ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => handleDayClick(day)}
              onDoubleClick={() => handleDayDoubleClick(day)}
            >
              <span className="day-number">{day.getDate()}</span>
              {dayEvents.length > 0 && (
                <div className="day-events">
                  {dayEvents.slice(0, 3).map((event, j) => (
                    <span
                      key={j}
                      className="event-dot"
                      style={{ backgroundColor: event.color || '#8b5cf6' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEventDetail(event);
                      }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="event-dot" style={{ backgroundColor: 'var(--text-tertiary)' }} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
