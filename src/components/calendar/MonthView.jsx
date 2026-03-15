import { useCalendar } from '../../contexts/CalendarContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, isSameMonth, isSameDay, isToday, getMonthDays } from '../../utils/dateUtils';
import { WEEKDAYS_SHORT } from '../../utils/constants';
import { hexToRgba } from '../../utils/colorUtils';

export default function MonthView() {
  const { selectedDate, setSelectedDate, getEventsForDate, openEventDetail } = useCalendar();
  const { user } = useAuth();
  const days = getMonthDays(selectedDate);

  const handleDayClick = (day) => {
    setSelectedDate(day);
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
            >
              <span className="day-number">{day.getDate()}</span>
              {dayEvents.length > 0 && (
                <div className="day-events">
                  {dayEvents.slice(0, 5).map((event, j) => (
                    <div
                      key={j}
                      className="event-bar"
                      style={{ 
                        backgroundColor: event.color || '#8b5cf6',
                        color: 'white'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEventDetail(event);
                      }}
                    >
                      <span className="event-bar-title">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 5 && (
                    <div className="event-bar-more">
                      +{dayEvents.length - 5} autre
                    </div>
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
