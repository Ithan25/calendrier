import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToEvents } from '../services/eventService';
import { VIEW_MODES } from '../utils/constants';

const CalendarContext = createContext(null);

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
  return ctx;
}

export function CalendarProvider({ children }) {
  const { userData } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTH);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    if (!userData?.pairId) {
      setEvents([]);
      return;
    }

    const unsub = subscribeToEvents(userData.pairId, (newEvents) => {
      setEvents(newEvents);
    });

    return unsub;
  }, [userData?.pairId]);

  const getEventsForDate = useCallback((date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  }, [events]);

  const getEventsForRange = useCallback((start, end) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= end && eventEnd >= start;
    });
  }, [events]);

  const openNewEvent = (date) => {
    setEditingEvent(null);
    setSelectedDate(date || new Date());
    setShowEventModal(true);
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const openEventDetail = (event) => {
    setSelectedEvent(event);
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
  };

  const value = {
    events,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    selectedEvent,
    showEventModal,
    editingEvent,
    getEventsForDate,
    getEventsForRange,
    openNewEvent,
    openEditEvent,
    closeEventModal,
    openEventDetail,
    closeEventDetail,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}
