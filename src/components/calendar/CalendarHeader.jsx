import { useCalendar } from '../../contexts/CalendarContext';
import { formatDate, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isToday } from '../../utils/dateUtils';
import { VIEW_MODES } from '../../utils/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarHeader() {
  const { selectedDate, setSelectedDate, viewMode } = useCalendar();

  const handlePrev = () => {
    switch (viewMode) {
      case VIEW_MODES.MONTH: setSelectedDate(subMonths(selectedDate, 1)); break;
      case VIEW_MODES.WEEK: setSelectedDate(subWeeks(selectedDate, 1)); break;
      case VIEW_MODES.DAY:
      case VIEW_MODES.AGENDA: setSelectedDate(subDays(selectedDate, 1)); break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case VIEW_MODES.MONTH: setSelectedDate(addMonths(selectedDate, 1)); break;
      case VIEW_MODES.WEEK: setSelectedDate(addWeeks(selectedDate, 1)); break;
      case VIEW_MODES.DAY:
      case VIEW_MODES.AGENDA: setSelectedDate(addDays(selectedDate, 1)); break;
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getTitle = () => {
    if (viewMode === VIEW_MODES.MONTH) {
      return formatDate(selectedDate, 'MMMM yyyy');
    }
    if (viewMode === VIEW_MODES.WEEK) {
      return formatDate(selectedDate, 'MMM yyyy');
    }
    return formatDate(selectedDate, 'd MMMM yyyy');
  };

  return (
    <div className="cal-header">
      <h2>{getTitle()}</h2>
      <div className="cal-header-center">
        {!isToday(selectedDate) && (
          <button className="cal-today-btn" onClick={handleToday}>
            Aujourd'hui
          </button>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button className="cal-nav-btn" onClick={handlePrev}>
            <ChevronLeft size={20} />
          </button>
          <button className="cal-nav-btn" onClick={handleNext}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
